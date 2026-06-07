import { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useAppStore } from '@/store';
import { CLUE_TYPES, RISK_LEVELS, CLUE_STATUS, AREAS } from '@/utils/constants';
import { formatDate, cn, generateId } from '@/utils/format';
import type { Clue } from '@/types';

export default function Clues() {
  const { clues, addClue, updateClue, deleteClue, mergeClues } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
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
      const newPhotos = Array.from(files).map(() => 
        `https://picsum.photos/400/300?random=${generateId()}`
      );
      setNewClue({ ...newClue, attachments: [...newClue.attachments, ...newPhotos] });
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
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      ...newClue,
      typeName: CLUE_TYPES[newClue.type],
      involvedPersons: newClue.involvedPersons.split(',').map(s => s.trim()).filter(Boolean),
      status: 'pending',
      statusName: '待处理',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      isDuplicate: false,
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
    mergeClues(mergeTargetId, mergeSourceIds);
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">线索详情</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
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

              <div className="grid grid-cols-2 gap-4">
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

              {selectedClue.mergedFrom && selectedClue.mergedFrom.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Link className="w-4 h-4" />
                    合并来源（{selectedClue.mergedFrom.length}条）
                  </p>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-sm text-purple-700">已合并 {selectedClue.mergedFrom.length} 条重复线索</p>
                  </div>
                </div>
              )}

              {selectedClue.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    现场照片（{selectedClue.attachments.length}张）
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedClue.attachments.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
