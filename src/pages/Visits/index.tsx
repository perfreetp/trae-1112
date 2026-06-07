import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Edit,
  XCircle,
  Camera,
  X,
  MapPin,
  User,
  FileText,
  Save,
  Link,
  Handshake
} from 'lucide-react';
import { useAppStore } from '@/store';
import { AREAS, GRID_WORKERS } from '@/utils/constants';
import { formatDate, cn, generateId } from '@/utils/format';
import type { Visit, TimelineRecord } from '@/types';

const getTimelineIcon = (action: string) => {
  switch (action) {
    case 'register': return <FileText className="w-4 h-4" />;
    case 'create_visit': return <User className="w-4 h-4" />;
    case 'complete_visit': return <CheckCircle className="w-4 h-4" />;
    case 'create_mediation': return <Handshake className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getTimelineColor = (action: string) => {
  switch (action) {
    case 'register': return 'bg-blue-500';
    case 'create_visit': return 'bg-green-500';
    case 'complete_visit': return 'bg-green-600';
    case 'create_mediation': return 'bg-orange-500';
    default: return 'bg-gray-400';
  }
};

const Timeline = ({ records }: { records: TimelineRecord[] }) => (
  <div className="space-y-4">
    {records.slice().reverse().map((record, idx) => (
      <div key={record.id} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0", getTimelineColor(record.action))}>
            {getTimelineIcon(record.action)}
          </div>
          {idx < records.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
        </div>
        <div className="flex-1 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{record.actionName}</span>
            <span className="text-xs text-gray-400">{formatDate(record.time)}</span>
          </div>
          <p className="text-sm text-gray-600">{record.description}</p>
          <p className="text-xs text-gray-400 mt-1">操作人：{record.operator}</p>
        </div>
      </div>
    ))}
  </div>
);

const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待走访', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-50' },
  overdue: { label: '已超期', color: 'text-red-600', bgColor: 'bg-red-50' },
};

export default function Visits() {
  const { visits, addVisit, updateVisit, user, addTimelineToVisit, clues } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [editForm, setEditForm] = useState({
    actualDate: '',
    content: '',
    issues: '',
    photos: [] as string[],
  });
  const [newVisit, setNewVisit] = useState({
    planDate: '',
    visitedPerson: '',
    visitedAddress: '',
    area: AREAS[0],
    visitor: GRID_WORKERS[0],
    purpose: '',
  });

  const filteredVisits = visits.filter(visit => {
    const matchSearch = visit.visitedPerson.includes(searchText) || visit.visitedAddress.includes(searchText);
    const matchStatus = filterStatus === 'all' || visit.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === 'pending').length,
    completed: visits.filter(v => v.status === 'completed').length,
    overdue: visits.filter(v => v.status === 'overdue').length,
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setEditForm(prev => ({ 
            ...prev, 
            photos: [...prev.photos, result] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setEditForm({ 
      ...editForm, 
      photos: editForm.photos.filter((_, i) => i !== index) 
    });
  };

  const openEdit = (visit: Visit) => {
    setSelectedVisit(visit);
    setEditForm({
      actualDate: visit.actualDate || new Date().toISOString().split('T')[0],
      content: visit.content || '',
      issues: visit.issues || '',
      photos: visit.photos || [],
    });
    setShowEdit(true);
  };

  const handleSaveEdit = () => {
    if (!selectedVisit) return;
    updateVisit(selectedVisit.id, {
      actualDate: new Date(editForm.actualDate).toISOString(),
      content: editForm.content,
      issues: editForm.issues,
      photos: editForm.photos,
      status: 'completed',
      statusName: '已完成',
    });
    addTimelineToVisit(
      selectedVisit.id, 
      'complete_visit', 
      user.name, 
      `完成走访，记录：${editForm.content.substring(0, 50)}...`
    );
    setShowEdit(false);
    setSelectedVisit(null);
  };

  const handleAddVisit = () => {
    if (!newVisit.planDate || !newVisit.visitedPerson) return;
    addVisit({
      id: generateId(),
      title: `${newVisit.purpose || '入户走访'} - ${newVisit.visitedPerson}`,
      planDate: new Date(newVisit.planDate).toISOString(),
      visitor: newVisit.visitor,
      visitedPerson: newVisit.visitedPerson,
      visitedAddress: newVisit.visitedAddress,
      area: newVisit.area,
      purpose: newVisit.purpose,
      content: '',
      photos: [],
      issues: '',
      status: 'pending',
      statusName: '待走访',
      createTime: new Date().toISOString(),
      timeline: [{
        id: generateId(),
        time: new Date().toISOString(),
        action: 'create_visit',
        actionName: '创建走访',
        operator: user.name,
        description: `创建走访计划：${newVisit.purpose || '入户走访'}`,
      }],
    });
    setShowModal(false);
    setNewVisit({
      planDate: '',
      visitedPerson: '',
      visitedAddress: '',
      area: AREAS[0],
      visitor: GRID_WORKERS[0],
      purpose: '',
    });
  };

  const getRelatedClue = (clueId?: string) => {
    if (!clueId) return null;
    return clues.find(c => c.id === clueId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">入户走访</h1>
          <p className="text-gray-500 mt-1">管理走访计划和走访记录</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
        >
          <Plus className="w-4 h-4" />
          新增走访计划
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">总走访数</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">待走访</p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">已完成</p>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">已超期</p>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索走访对象、地址..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'completed', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {status === 'all' ? '全部' : statusMap[status].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {visit.visitedPerson.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{visit.visitedPerson}</h4>
                  <p className="text-sm text-gray-500">{visit.area}</p>
                </div>
              </div>
              <span className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full",
                statusMap[visit.status].bgColor,
                statusMap[visit.status].color
              )}>
                {visit.statusName}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              {visit.clueTitle && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Link className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-xs">来源：{visit.clueTitle}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{visit.visitedAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>走访人：{visit.visitor}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>计划：{formatDate(visit.planDate)}</span>
              </div>
              {visit.actualDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>实际：{formatDate(visit.actualDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{visit.purpose || '未填写目的'}</span>
              </div>
            </div>

            {visit.photos && visit.photos.length > 0 && (
              <div className="mt-4 flex gap-2">
                {visit.photos.slice(0, 3).map((photo, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {visit.photos.length > 3 && (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                    +{visit.photos.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => { setSelectedVisit(visit); setShowDetail(true); }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                查看
              </button>
              {visit.status !== 'completed' && (
                <button
                  onClick={() => openEdit(visit)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  录入结果
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVisits.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">暂无走访记录</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">新增走访计划</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">走访对象 *</label>
                <input
                  type="text"
                  value={newVisit.visitedPerson}
                  onChange={(e) => setNewVisit({ ...newVisit, visitedPerson: e.target.value })}
                  placeholder="请输入走访对象姓名"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">计划走访日期 *</label>
                <input
                  type="date"
                  value={newVisit.planDate}
                  onChange={(e) => setNewVisit({ ...newVisit, planDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">所属区域</label>
                <select
                  value={newVisit.area}
                  onChange={(e) => setNewVisit({ ...newVisit, area: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">走访地址</label>
                <input
                  type="text"
                  value={newVisit.visitedAddress}
                  onChange={(e) => setNewVisit({ ...newVisit, visitedAddress: e.target.value })}
                  placeholder="请输入详细地址"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">走访人</label>
                <select
                  value={newVisit.visitor}
                  onChange={(e) => setNewVisit({ ...newVisit, visitor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GRID_WORKERS.map((worker) => (
                    <option key={worker} value={worker}>{worker}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">走访目的</label>
                <textarea
                  value={newVisit.purpose}
                  onChange={(e) => setNewVisit({ ...newVisit, purpose: e.target.value })}
                  placeholder="请输入走访目的"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddVisit}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                创建计划
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">走访详情</h3>
              <div className="flex items-center gap-2">
                {selectedVisit.status !== 'completed' && (
                  <button
                    onClick={() => { setShowDetail(false); openEdit(selectedVisit); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    录入结果
                  </button>
                )}
                <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedVisit.visitedPerson.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedVisit.visitedPerson}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-full",
                      statusMap[selectedVisit.status].bgColor,
                      statusMap[selectedVisit.status].color
                    )}>
                      {selectedVisit.statusName}
                    </span>
                    <span className="text-sm text-gray-500">{selectedVisit.area}</span>
                  </div>
                </div>
              </div>

              {selectedVisit.clueId && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Link className="w-4 h-4" />
                    <span className="text-sm font-medium">关联线索：</span>
                    <span className="text-sm">{getRelatedClue(selectedVisit.clueId)?.title || selectedVisit.clueTitle}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">走访地址</p>
                  <p className="text-sm font-medium text-gray-900">{selectedVisit.visitedAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">走访人</p>
                  <p className="text-sm font-medium text-gray-900">{selectedVisit.visitor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">计划走访日期</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedVisit.planDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">实际走访日期</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedVisit.actualDate ? formatDate(selectedVisit.actualDate) : '未走访'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">走访目的</p>
                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
                  {selectedVisit.purpose || '未填写'}
                </div>
              </div>

              {selectedVisit.content && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">走访记录</p>
                  <div className="p-4 bg-blue-50 rounded-xl text-sm text-gray-700">
                    {selectedVisit.content}
                  </div>
                </div>
              )}

              {selectedVisit.issues && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">发现问题</p>
                  <div className="p-4 bg-orange-50 rounded-xl text-sm text-gray-700">
                    {selectedVisit.issues}
                  </div>
                </div>
              )}

              {selectedVisit.photos && selectedVisit.photos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    现场照片（{selectedVisit.photos.length}张）
                  </p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedVisit.photos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  处理时间轴
                </p>
                <Timeline records={selectedVisit.timeline || []} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEdit(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">录入走访结果</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  <strong>走访对象：</strong>{selectedVisit.visitedPerson}
                  <span className="mx-3">|</span>
                  <strong>计划日期：</strong>{formatDate(selectedVisit.planDate)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">实际走访日期 *</label>
                <input
                  type="date"
                  value={editForm.actualDate}
                  onChange={(e) => setEditForm({ ...editForm, actualDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">走访记录 *</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="请详细记录走访情况、沟通内容、当事人态度等"
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">发现问题</label>
                <textarea
                  value={editForm.issues}
                  onChange={(e) => setEditForm({ ...editForm, issues: e.target.value })}
                  placeholder="请记录走访中发现的问题，如无问题可填'无'"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">现场照片</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                  <div className="flex flex-wrap gap-3 mb-3">
                    {editForm.photos.map((photo, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">添加照片</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">支持 JPG、PNG 格式，最多上传 9 张</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存并完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
