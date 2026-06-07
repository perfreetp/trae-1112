import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Eye,
  Merge,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  LocateFixed,
  Link,
  Image as ImageIcon,
  X,
  Check,
  User,
  Calendar,
  FileText,
  UserPlus,
  Handshake,
  ChevronRight,
  Home,
  Bell
} from 'lucide-react';
import { useAppStore } from '@/store';
import { CLUE_TYPES, RISK_LEVELS, CLUE_STATUS, AREAS, GRID_WORKERS, MEDIATORS } from '@/utils/constants';
import { formatDate, cn, generateId } from '@/utils/format';
import type { Clue, TimelineRecord } from '@/types';

const getTimelineIcon = (action: string) => {
  switch (action) {
    case 'register': return <FileText className="w-4 h-4" />;
    case 'merge': return <Merge className="w-4 h-4" />;
    case 'create_visit': return <UserPlus className="w-4 h-4" />;
    case 'complete_visit': return <CheckCircle className="w-4 h-4" />;
    case 'create_mediation': return <Handshake className="w-4 h-4" />;
    case 'assign_mediator': return <User className="w-4 h-4" />;
    case 'mediation_record': return <FileText className="w-4 h-4" />;
    case 'escalate': return <AlertTriangle className="w-4 h-4" />;
    case 'resolve': return <CheckCircle className="w-4 h-4" />;
    case 'close': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getTimelineColor = (action: string) => {
  switch (action) {
    case 'register': return 'bg-blue-500';
    case 'merge': return 'bg-purple-500';
    case 'create_visit': return 'bg-green-500';
    case 'complete_visit': return 'bg-green-600';
    case 'create_mediation': return 'bg-orange-500';
    case 'assign_mediator': return 'bg-orange-600';
    case 'mediation_record': return 'bg-gray-500';
    case 'escalate': return 'bg-red-500';
    case 'resolve': return 'bg-emerald-500';
    case 'close': return 'bg-gray-600';
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

export default function Clues() {
  const navigate = useNavigate();
  const { 
    clues, 
    addClue, 
    updateClue, 
    deleteClue, 
    mergeClues,
    createVisitFromClue,
    createMediationFromClue,
    getVisitsByClueId,
    getMediationsByClueId,
    getMessagesByRelatedId,
    user
  } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [showCreateVisit, setShowCreateVisit] = useState(false);
  const [showCreateMediation, setShowCreateMediation] = useState(false);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');
  const [mergeSourceIds, setMergeSourceIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newClue, setNewClue] = useState({
    title: '',
    type: 'neighbor' as const,
    description: '',
    location: '',
    area: AREAS[0],
    latitude: 30.6598,
    longitude: 104.0633,
    involvedPersons: '',
    reporter: '',
    reporterPhone: '',
    riskLevel: 'medium' as const,
    attachments: [] as string[],
  });
  const [visitForm, setVisitForm] = useState({
    planDate: '',
    visitor: '',
    purpose: '线索核实走访',
    content: '',
  });
  const [mediationForm, setMediationForm] = useState({
    mediator: '',
    deadline: '',
    content: '',
  });

  const filteredClues = clues.filter(clue => {
    const matchSearch = clue.title.includes(searchText) || clue.description.includes(searchText);
    const matchType = filterType === 'all' || clue.type === filterType;
    const matchRisk = filterRisk === 'all' || clue.riskLevel === filterRisk;
    const matchStatus = filterStatus === 'all' || clue.status === filterStatus;
    return matchSearch && matchType && matchRisk && matchStatus;
  });

  const duplicateClues = clues.filter(c => c.isDuplicate);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setNewClue(prev => ({ 
            ...prev, 
            attachments: [...prev.attachments, result] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setNewClue({ 
      ...newClue, 
      attachments: newClue.attachments.filter((_, i) => i !== index) 
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewClue({
            ...newClue,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          alert('定位成功！坐标已更新');
        },
        () => {
          alert('定位失败，请手动输入坐标');
        }
      );
    } else {
      alert('您的浏览器不支持地理定位');
    }
  };

  const handleSubmit = () => {
    if (!newClue.title.trim()) return;
    addClue({
      id: generateId(),
      ...newClue,
      typeName: CLUE_TYPES[newClue.type],
      involvedPersons: newClue.involvedPersons.split(',').map(s => s.trim()).filter(Boolean),
      status: 'pending',
      statusName: '待处理',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      isDuplicate: false,
      timeline: [{
        id: generateId(),
        time: new Date().toISOString(),
        action: 'register',
        actionName: '线索登记',
        operator: newClue.reporter || user.name,
        description: `网格员上报线索：${newClue.title}`,
      }],
    });
    setShowModal(false);
    setNewClue({
      title: '',
      type: 'neighbor',
      description: '',
      location: '',
      area: AREAS[0],
      latitude: 30.6598,
      longitude: 104.0633,
      involvedPersons: '',
      reporter: '',
      reporterPhone: '',
      riskLevel: 'medium',
      attachments: [],
    });
  };

  const handleMerge = () => {
    if (!mergeTargetId || mergeSourceIds.length === 0) return;
    mergeClues(mergeTargetId, mergeSourceIds, user.name);
    setShowMerge(false);
    setMergeTargetId('');
    setMergeSourceIds([]);
  };

  const toggleMergeSource = (id: string) => {
    if (mergeSourceIds.includes(id)) {
      setMergeSourceIds(mergeSourceIds.filter(i => i !== id));
    } else {
      setMergeSourceIds([...mergeSourceIds, id]);
    }
  };

  const handleCreateVisit = () => {
    if (!selectedClue || !visitForm.planDate) return;
    createVisitFromClue(selectedClue.id, {
      planDate: new Date(visitForm.planDate).toISOString(),
      visitor: visitForm.visitor || user.name,
      purpose: visitForm.purpose,
      content: visitForm.content,
    }, user.name);
    setShowCreateVisit(false);
    setShowDetail(false);
    setVisitForm({ planDate: '', visitor: '', purpose: '线索核实走访', content: '' });
    alert('走访任务已创建！可在「入户走访」页面查看');
  };

  const handleCreateMediation = () => {
    if (!selectedClue || !mediationForm.mediator) return;
    createMediationFromClue(selectedClue.id, {
      mediator: mediationForm.mediator,
      deadline: mediationForm.deadline ? new Date(mediationForm.deadline).toISOString() : undefined,
    }, user.name);
    setShowCreateMediation(false);
    setShowDetail(false);
    setMediationForm({ mediator: '', deadline: '', content: '' });
    alert('调解案件已创建！可在「调解流转」页面查看');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">线索登记</h1>
          <p className="text-gray-500 mt-1">管理矛盾纠纷线索信息</p>
        </div>
        <div className="flex items-center gap-3">
          {duplicateClues.length > 0 && (
            <button
              onClick={() => {
                setMergeTargetId(duplicateClues[0].id);
                setShowMerge(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <Merge className="w-4 h-4" />
              处理重复线索 ({duplicateClues.length})
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            <Plus className="w-4 h-4" />
            新增线索
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索线索标题、描述..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              {Object.entries(CLUE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部风险</option>
              {Object.entries(RISK_LEVELS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              {Object.entries(CLUE_STATUS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">线索信息</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">类型</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">区域</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">风险等级</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClues.map((clue) => (
                <tr key={clue.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{clue.title}</p>
                          {clue.mergedFrom && clue.mergedFrom.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded font-medium flex items-center gap-1">
                              <Link className="w-3 h-3" />
                              已合并{clue.mergedFrom.length}条
                            </span>
                          )}
                          {clue.isDuplicate && (
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded font-medium">
                              疑似重复
                            </span>
                          )}
                          {clue.attachments.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded font-medium flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {clue.attachments.length}张
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{clue.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{clue.typeName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{clue.area}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-full",
                      RISK_LEVELS[clue.riskLevel].bgColor,
                      RISK_LEVELS[clue.riskLevel].color
                    )}>
                      {RISK_LEVELS[clue.riskLevel].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
                      CLUE_STATUS[clue.status].bgColor,
                      CLUE_STATUS[clue.status].color
                    )}>
                      {clue.status === 'resolved' || clue.status === 'closed' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : clue.status === 'pending' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {CLUE_STATUS[clue.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formatDate(clue.createTime)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setSelectedClue(clue); setShowDetail(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="编辑">
                        <Edit className="w-4 h-4" />
                      </button>
                      {clue.isDuplicate && (
                        <button 
                          onClick={() => { setMergeTargetId(clue.id); setShowMerge(true); }}
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="合并重复线索"
                        >
                          <Merge className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteClue(clue.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClues.length === 0 && (
          <div className="py-12 text-center">
            <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无匹配的线索数据</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">新增线索</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">线索标题 *</label>
                  <input
                    type="text"
                    value={newClue.title}
                    onChange={(e) => setNewClue({ ...newClue, title: e.target.value })}
                    placeholder="请输入线索标题"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">纠纷类型</label>
                  <select
                    value={newClue.type}
                    onChange={(e) => setNewClue({ ...newClue, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CLUE_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">所属区域</label>
                  <select
                    value={newClue.area}
                    onChange={(e) => setNewClue({ ...newClue, area: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">发生地点</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newClue.location}
                      onChange={(e) => setNewClue({ ...newClue, location: e.target.value })}
                      placeholder="请输入详细地址"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <LocateFixed className="w-4 h-4" />
                      定位
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">纬度</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newClue.latitude}
                    onChange={(e) => setNewClue({ ...newClue, latitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">经度</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newClue.longitude}
                    onChange={(e) => setNewClue({ ...newClue, longitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">风险等级</label>
                  <select
                    value={newClue.riskLevel}
                    onChange={(e) => setNewClue({ ...newClue, riskLevel: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(RISK_LEVELS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">涉及人员</label>
                  <input
                    type="text"
                    value={newClue.involvedPersons}
                    onChange={(e) => setNewClue({ ...newClue, involvedPersons: e.target.value })}
                    placeholder="多人用逗号分隔"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">上报人</label>
                  <input
                    type="text"
                    value={newClue.reporter}
                    onChange={(e) => setNewClue({ ...newClue, reporter: e.target.value })}
                    placeholder="请输入上报人姓名"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
                  <input
                    type="tel"
                    value={newClue.reporterPhone}
                    onChange={(e) => setNewClue({ ...newClue, reporterPhone: e.target.value })}
                    placeholder="请输入联系电话"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">照片附件</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                    <div className="flex flex-wrap gap-3 mb-3">
                      {newClue.attachments.map((photo, index) => (
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">情况描述</label>
                  <textarea
                    value={newClue.description}
                    onChange={(e) => setNewClue({ ...newClue, description: e.target.value })}
                    placeholder="请详细描述纠纷情况"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
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
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">线索详情</h3>
              <div className="flex items-center gap-2">
                {selectedClue.status !== 'resolved' && selectedClue.status !== 'closed' && (
                  <>
                    <button
                      onClick={() => setShowCreateVisit(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      发起走访
                    </button>
                    <button
                      onClick={() => setShowCreateMediation(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm"
                    >
                      <Handshake className="w-4 h-4" />
                      转入调解
                    </button>
                  </>
                )}
                <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedClue.title}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                    {selectedClue.typeName}
                  </span>
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full",
                    RISK_LEVELS[selectedClue.riskLevel].bgColor,
                    RISK_LEVELS[selectedClue.riskLevel].color
                  )}>
                    {RISK_LEVELS[selectedClue.riskLevel].label}
                  </span>
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full",
                    CLUE_STATUS[selectedClue.status].bgColor,
                    CLUE_STATUS[selectedClue.status].color
                  )}>
                    {CLUE_STATUS[selectedClue.status].label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">所属区域</p>
                  <p className="text-sm font-medium text-gray-900">{selectedClue.area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">发生地点</p>
                  <p className="text-sm font-medium text-gray-900">{selectedClue.location || '未填写'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">经纬度</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedClue.latitude && selectedClue.longitude 
                      ? `${selectedClue.latitude.toFixed(4)}, ${selectedClue.longitude.toFixed(4)}`
                      : '未定位'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">登记时间</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedClue.createTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">上报人</p>
                  <p className="text-sm font-medium text-gray-900">{selectedClue.reporter || '匿名'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">涉及人员</p>
                  <p className="text-sm font-medium text-gray-900">{selectedClue.involvedPersons.join('、')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">情况描述</p>
                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedClue.description || '暂无描述'}
                </div>
              </div>

              {selectedClue.mergedInfos && selectedClue.mergedInfos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Link className="w-4 h-4" />
                    合并来源（{selectedClue.mergedInfos.length}条）
                  </p>
                  <div className="space-y-2">
                    {selectedClue.mergedInfos.map((info, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-purple-700">{info.sourceTitle}</p>
                          <p className="text-xs text-purple-500">{formatDate(info.mergeTime)}</p>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">{info.sourceLocation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClue.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    现场照片（{selectedClue.attachments.length}张）
                  </p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedClue.attachments.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  办理跟踪
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div 
                    onClick={() => { setShowDetail(false); navigate('/visits'); }}
                    className="p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <Home className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">走访任务</span>
                      </div>
                      <span className="px-2 py-0.5 bg-green-200 text-green-700 text-xs rounded-full">
                        {getVisitsByClueId(selectedClue.id).length} 条
                      </span>
                    </div>
                    <div className="space-y-2 mt-3">
                      {getVisitsByClueId(selectedClue.id).slice(0, 2).map(v => (
                        <div key={v.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 truncate">{v.title}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded",
                            v.status === 'completed' ? 'bg-green-200 text-green-700' :
                            v.status === 'overdue' ? 'bg-red-200 text-red-700' :
                            'bg-yellow-200 text-yellow-700'
                          )}>
                            {v.statusName}
                          </span>
                        </div>
                      ))}
                      {getVisitsByClueId(selectedClue.id).length === 0 && (
                        <p className="text-xs text-gray-400">暂无走访记录</p>
                      )}
                    </div>
                  </div>
                  <div 
                    onClick={() => { setShowDetail(false); navigate('/mediation'); }}
                    className="p-4 bg-orange-50 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Handshake className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">调解案件</span>
                      </div>
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-700 text-xs rounded-full">
                        {getMediationsByClueId(selectedClue.id).length} 条
                      </span>
                    </div>
                    <div className="space-y-2 mt-3">
                      {getMediationsByClueId(selectedClue.id).slice(0, 2).map(m => (
                        <div key={m.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 truncate">{m.title}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded",
                            m.result === 'success' ? 'bg-green-200 text-green-700' :
                            m.result === 'escalated' ? 'bg-red-200 text-red-700' :
                            'bg-blue-200 text-blue-700'
                          )}>
                            {m.statusName}
                          </span>
                        </div>
                      ))}
                      {getMediationsByClueId(selectedClue.id).length === 0 && (
                        <p className="text-xs text-gray-400">暂无调解记录</p>
                      )}
                    </div>
                  </div>
                </div>
                <div 
                  onClick={() => { setShowDetail(false); navigate('/messages'); }}
                  className="p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors mb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">相关消息</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-200 text-blue-700 text-xs rounded-full">
                        {getMessagesByRelatedId(selectedClue.id, 'clue').length + 
                         getVisitsByClueId(selectedClue.id).reduce((sum, v) => sum + getMessagesByRelatedId(v.id, 'visit').length, 0) +
                         getMediationsByClueId(selectedClue.id).reduce((sum, m) => sum + getMessagesByRelatedId(m.id, 'mediation').length, 0)} 条
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  处理时间轴
                </p>
                <Timeline records={selectedClue.timeline || []} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateVisit && selectedClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateVisit(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">发起入户走访</h3>
              <button onClick={() => setShowCreateVisit(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">线索：{selectedClue.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">计划走访日期 *</label>
                <input
                  type="date"
                  value={visitForm.planDate}
                  onChange={(e) => setVisitForm({ ...visitForm, planDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">走访负责人</label>
                <select
                  value={visitForm.visitor}
                  onChange={(e) => setVisitForm({ ...visitForm, visitor: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择负责人</option>
                  {GRID_WORKERS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">走访目的</label>
                <input
                  type="text"
                  value={visitForm.purpose}
                  onChange={(e) => setVisitForm({ ...visitForm, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">处理说明</label>
                <textarea
                  value={visitForm.content}
                  onChange={(e) => setVisitForm({ ...visitForm, content: e.target.value })}
                  placeholder="请输入走访说明"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateVisit(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateVisit}
                disabled={!visitForm.planDate}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建走访
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateMediation && selectedClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateMediation(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">转入调解</h3>
              <button onClick={() => setShowCreateMediation(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <p className="text-sm text-orange-700">线索：{selectedClue.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">调解员 *</label>
                <select
                  value={mediationForm.mediator}
                  onChange={(e) => setMediationForm({ ...mediationForm, mediator: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择调解员</option>
                  {MEDIATORS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">调解截止日期</label>
                <input
                  type="date"
                  value={mediationForm.deadline}
                  onChange={(e) => setMediationForm({ ...mediationForm, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">处理说明</label>
                <textarea
                  value={mediationForm.content}
                  onChange={(e) => setMediationForm({ ...mediationForm, content: e.target.value })}
                  placeholder="请输入调解说明"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateMediation(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateMediation}
                disabled={!mediationForm.mediator}
                className="px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建调解
              </button>
            </div>
          </div>
        </div>
      )}

      {showMerge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMerge(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">合并重复线索</h3>
              <button onClick={() => setShowMerge(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择目标线索（合并后保留）</label>
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择目标线索</option>
                  {duplicateClues.map((clue) => (
                    <option key={clue.id} value={clue.id}>{clue.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择要合并的线索（合并后删除）</label>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {duplicateClues.filter(c => c.id !== mergeTargetId).map((clue) => (
                    <label 
                      key={clue.id} 
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={mergeSourceIds.includes(clue.id)}
                        onChange={() => toggleMergeSource(clue.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{clue.title}</p>
                        <p className="text-xs text-gray-500">{clue.area} · {formatDate(clue.createTime)}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        RISK_LEVELS[clue.riskLevel].bgColor,
                        RISK_LEVELS[clue.riskLevel].color
                      )}>
                        {RISK_LEVELS[clue.riskLevel].label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  <strong>提示：</strong>合并后，被选中的线索将被删除，其描述、涉及人员和附件将合并到目标线索中。
                </p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowMerge(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleMerge}
                disabled={!mergeTargetId || mergeSourceIds.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Merge className="w-4 h-4" />
                确认合并 ({mergeSourceIds.length}条)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
