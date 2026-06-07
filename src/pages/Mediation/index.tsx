import { useState } from 'react';
import { 
  Handshake, 
  User, 
  Phone, 
  Clock, 
  AlertTriangle, 
  ArrowUp,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  UserCheck,
  MessageSquare,
  Star,
  UserPlus,
  ChevronRight,
  X
} from 'lucide-react';
import { useAppStore } from '@/store';
import { MEDIATORS } from '@/utils/constants';
import { formatDate, cn } from '@/utils/format';
import type { Mediation } from '@/types';

export default function MediationPage() {
  const { mediations, updateMediation } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(mediations[0]?.id || null);
  const [showUserPlus, setShowUserPlus] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [selectedMediation, setSelectedMediation] = useState<Mediation | null>(null);
  const [assignMediator, setUserPlusMediator] = useState('');
  const [escalateReason, setEscalateReason] = useState('');

  const selected = mediations.find(m => m.id === selectedId) || null;

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false;
    const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft >= 0;
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < Date.now();
  };

  const getDeadlineText = (deadline?: string) => {
    if (!deadline) return '';
    const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return `已超期${Math.abs(daysLeft)}天`;
    if (daysLeft === 0) return '今天截止';
    if (daysLeft <= 3) return `剩余${daysLeft}天`;
    return `剩余${daysLeft}天`;
  };

  const openUserPlus = (m: Mediation) => {
    setSelectedMediation(m);
    setUserPlusMediator(m.mediator);
    setShowUserPlus(true);
  };

  const handleUserPlus = () => {
    if (!selectedMediation || !assignMediator) return;
    updateMediation(selectedMediation.id, {
      mediator: assignMediator,
      status: 'mediating',
      statusName: '调解中',
    });
    setShowUserPlus(false);
    setSelectedMediation(null);
  };

  const openEscalate = (m: Mediation) => {
    setSelectedMediation(m);
    setEscalateReason('');
    setShowEscalate(true);
  };

  const handleEscalate = () => {
    if (!selectedMediation || !escalateReason.trim()) return;
    updateMediation(selectedMediation.id, {
      result: 'escalated',
      resultName: '已升级',
      status: 'closed',
      statusName: '已升级上报',
    });
    setShowEscalate(false);
    setSelectedMediation(null);
    setEscalateReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">调解流转</h1>
          <p className="text-gray-500 mt-1">管理调解案件流转全过程</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">待派单</p>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {mediations.filter(m => m.status === 'assigned').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">调解中</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {mediations.filter(m => m.status === 'mediating').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">调解成功</p>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {mediations.filter(m => m.result === 'success').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">已升级</p>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {mediations.filter(m => m.result === 'escalated').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
          {mediations.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={cn(
                "p-4 rounded-2xl cursor-pointer transition-all border",
                selectedId === m.id
                  ? "bg-blue-50 border-blue-200 shadow-md"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{m.title}</h4>
                <ChevronRight className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  selectedId === m.id ? "text-blue-600" : "text-gray-400"
                )} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{m.mediator}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  m.status === 'assigned' && "bg-yellow-100 text-yellow-700",
                  m.status === 'mediating' && "bg-blue-100 text-blue-700",
                  m.status === 'completed' && "bg-green-100 text-green-700",
                  m.status === 'closed' && "bg-gray-100 text-gray-700",
                )}>
                  {m.statusName}
                </span>
                {m.deadline && (m.status === 'assigned' || m.status === 'mediating') && (
                  <span className={cn(
                    "text-xs flex items-center gap-1",
                    isOverdue(m.deadline) && "text-red-600",
                    isDeadlineNear(m.deadline) && !isOverdue(m.deadline) && "text-orange-600",
                    !isDeadlineNear(m.deadline) && !isOverdue(m.deadline) && "text-gray-400"
                  )}>
                    <Clock className="w-3 h-3" />
                    {getDeadlineText(m.deadline)}
                  </span>
                )}
              </div>
              {isDeadlineNear(m.deadline) && !isOverdue(m.deadline) && (m.status === 'assigned' || m.status === 'mediating') && (
                <div className="mt-2 px-2 py-1 bg-orange-50 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">即将到期，请尽快处理</span>
                </div>
              )}
              {isOverdue(m.deadline) && (m.status === 'assigned' || m.status === 'mediating') && (
                <div className="mt-2 px-2 py-1 bg-red-50 rounded-lg flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600">已超期，请及时处理</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {selected ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selected.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn(
                        "px-2.5 py-1 text-xs font-medium rounded-full",
                        selected.status === 'assigned' && "bg-yellow-100 text-yellow-700",
                        selected.status === 'mediating' && "bg-blue-100 text-blue-700",
                        selected.status === 'completed' && "bg-green-100 text-green-700",
                        selected.status === 'closed' && "bg-gray-100 text-gray-700",
                      )}>
                        {selected.statusName}
                      </span>
                      <span className={cn(
                        "px-2.5 py-1 text-xs font-medium rounded-full",
                        selected.result === 'pending' && "bg-gray-100 text-gray-600",
                        selected.result === 'success' && "bg-green-100 text-green-700",
                        selected.result === 'failed' && "bg-red-100 text-red-700",
                        selected.result === 'escalated' && "bg-purple-100 text-purple-700",
                      )}>
                        {selected.resultName}
                      </span>
                      <span className="text-sm text-gray-500">{selected.area}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(selected.status === 'assigned' || selected.status === 'mediating') && (
                      <>
                        <button
                          onClick={() => openUserPlus(selected)}
                          className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          改派调解员
                        </button>
                        {selected.riskLevel !== 'low' && (
                          <button
                            onClick={() => openEscalate(selected)}
                            className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <ArrowUp className="w-4 h-4" />
                            升级上报
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {selected.deadline && (selected.status === 'assigned' || selected.status === 'mediating') && (
                  <div className={cn(
                    "p-3 rounded-xl flex items-center gap-2",
                    isOverdue(selected.deadline) && "bg-red-50",
                    isDeadlineNear(selected.deadline) && !isOverdue(selected.deadline) && "bg-orange-50",
                    !isDeadlineNear(selected.deadline) && !isOverdue(selected.deadline) && "bg-blue-50"
                  )}>
                    <Clock className={cn(
                      "w-5 h-5",
                      isOverdue(selected.deadline) && "text-red-500",
                      isDeadlineNear(selected.deadline) && !isOverdue(selected.deadline) && "text-orange-500",
                      !isDeadlineNear(selected.deadline) && !isOverdue(selected.deadline) && "text-blue-500"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isOverdue(selected.deadline) && "text-red-700",
                      isDeadlineNear(selected.deadline) && !isOverdue(selected.deadline) && "text-orange-700",
                      !isDeadlineNear(selected.deadline) && !isOverdue(selected.deadline) && "text-blue-700"
                    )}>
                      <strong>调解截止：</strong>{formatDate(selected.deadline)}（{getDeadlineText(selected.deadline)}）
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    当事人信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.parties.map((party, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{party.name}</p>
                            <p className="text-xs text-gray-500">
                              {party.role === 'plaintiff' ? '申请人' : party.role === 'defendant' ? '被申请人' : '证人'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{party.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    负责调解员
                  </h4>
                  <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {selected.mediator.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selected.mediator}</p>
                        <p className="text-xs text-gray-500">{selected.mediatorPhone || '暂无电话'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">开始时间</p>
                      <p className="text-sm font-medium text-gray-700">{formatDate(selected.startTime)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    调解记录
                  </h4>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-4">
                      {selected.records.map((record, idx) => (
                        <div key={record.id} className="relative pl-10">
                          <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow" />
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">第{idx + 1}次调解</p>
                              <span className="text-xs text-gray-500">{formatDate(record.time)}</span>
                            </div>
                            <p className="text-sm text-gray-600">{record.content}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <span>参与人：{record.participants.join('、')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selected.agreement && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      调解协议
                    </h4>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-sm text-gray-700">{selected.agreement}</p>
                    </div>
                  </div>
                )}

                {selected.followUp && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      回访信息
                    </h4>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{selected.followUp.visitor}</span>
                          <span className="text-xs text-gray-500">回访</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < selected.followUp.satisfaction
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{selected.followUp.content}</p>
                      <p className="text-xs text-gray-500">群众评价：{selected.followUp.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">回访时间：{formatDate(selected.followUp.time)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center">
                <Handshake className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">请选择一个调解案件查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserPlus && selectedMediation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUserPlus(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">指派调解员</h3>
              <button onClick={() => setShowUserPlus(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>案件：</strong>{selectedMediation.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">选择调解员</label>
                <select
                  value={assignMediator}
                  onChange={(e) => setUserPlusMediator(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择调解员</option>
                  {MEDIATORS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowUserPlus(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUserPlus}
                disabled={!assignMediator}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                确认派单
              </button>
            </div>
          </div>
        </div>
      )}

      {showEscalate && selectedMediation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEscalate(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">升级上报</h3>
              <button onClick={() => setShowEscalate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  升级上报后，案件将提交给街道综治中心处理，当前调解流程结束。
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>案件：</strong>{selectedMediation.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>当前调解员：</strong>{selectedMediation.mediator}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">升级原因 *</label>
                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="请详细说明升级上报的原因"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowEscalate(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalateReason.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowUp className="w-4 h-4" />
                确认升级
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
