import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Camera,
  Eye,
  Edit,
  XCircle
} from 'lucide-react';
import { useAppStore } from '@/store';
import { VISIT_STATUS, AREAS, GRID_WORKERS } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import { cn, generateId } from '@/utils/format';

export default function Visits() {
  const { visits, addVisit } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newVisit, setNewVisit] = useState({
    planDate: '',
    visitor: GRID_WORKERS[0],
    visitedPerson: '',
    visitedAddress: '',
    area: AREAS[0],
    purpose: '',
  });

  const filteredVisits = visits.filter(visit => {
    const matchSearch = visit.visitedPerson.includes(searchText) || 
                        visit.visitedAddress.includes(searchText) ||
                        visit.purpose.includes(searchText);
    const matchStatus = filterStatus === 'all' || visit.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    pending: visits.filter(v => v.status === 'pending').length,
    completed: visits.filter(v => v.status === 'completed').length,
    overdue: visits.filter(v => v.status === 'overdue').length,
  };

  const handleSubmit = () => {
    if (!newVisit.visitedPerson.trim() || !newVisit.planDate) return;
    addVisit({
      id: generateId(),
      ...newVisit,
      content: '',
      photos: [],
      issues: '',
      status: 'pending',
      statusName: '待走访',
      createTime: new Date().toISOString(),
    });
    setShowModal(false);
    setNewVisit({
      planDate: '',
      visitor: GRID_WORKERS[0],
      visitedPerson: '',
      visitedAddress: '',
      area: AREAS[0],
      purpose: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">入户走访</h1>
          <p className="text-gray-500 mt-1">管理走访任务和记录</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
        >
          <Plus className="w-4 h-4" />
          新增走访
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-500">待走访</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-500">已完成</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            <p className="text-sm text-gray-500">已超期</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索走访对象、地址、目的..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            {['all', 'pending', 'completed', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {status === 'all' ? '全部' : VISIT_STATUS[status as keyof typeof VISIT_STATUS].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisits.map((visit) => (
          <div 
            key={visit.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  visit.status === 'completed' ? 'bg-green-100' : visit.status === 'overdue' ? 'bg-red-100' : 'bg-yellow-100'
                )}>
                  <User className={cn(
                    "w-5 h-5",
                    visit.status === 'completed' ? 'text-green-600' : visit.status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                  )} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{visit.visitedPerson}</p>
                  <p className="text-xs text-gray-500">{visit.area}</p>
                </div>
              </div>
              <span className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full",
                VISIT_STATUS[visit.status].bgColor,
                VISIT_STATUS[visit.status].color
              )}>
                {VISIT_STATUS[visit.status].label}
              </span>
            </div>
            
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{visit.visitedAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>计划：{formatDate(visit.planDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>走访人：{visit.visitor}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <p className="text-xs text-gray-500 mb-1">走访目的</p>
              <p className="text-sm text-gray-700">{visit.purpose}</p>
            </div>

            {visit.status === 'completed' && visit.content && (
              <div className="p-3 bg-green-50 rounded-xl mb-4">
                <p className="text-xs text-green-600 mb-1">走访记录</p>
                <p className="text-sm text-gray-700 line-clamp-2">{visit.content}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {visit.photos.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{visit.photos.length}张照片</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVisits.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 text-center">
          <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无匹配的走访记录</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">新增走访计划</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">计划日期 *</label>
                  <input
                    type="date"
                    value={newVisit.planDate}
                    onChange={(e) => setNewVisit({ ...newVisit, planDate: e.target.value })}
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
                    {GRID_WORKERS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">走访对象 *</label>
                  <input
                    type="text"
                    value={newVisit.visitedPerson}
                    onChange={(e) => setNewVisit({ ...newVisit, visitedPerson: e.target.value })}
                    placeholder="请输入姓名"
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
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">详细地址</label>
                <input
                  type="text"
                  value={newVisit.visitedAddress}
                  onChange={(e) => setNewVisit({ ...newVisit, visitedAddress: e.target.value })}
                  placeholder="请输入详细地址"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
