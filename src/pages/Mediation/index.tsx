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
  X,
  Link
} from 'lucide-react';
import { useAppStore } from '@/store';
import { MEDIATORS } from '@/utils/constants';
import { formatDate, cn } from '@/utils/format';
import type { Mediation, TimelineRecord } from '@/types';

const getTimelineIcon = (action: string) => {
  switch (action) {
    case 'register': return <FileText className="w-4 h-4" />;
    case 'create_mediation': return <Handshake className="w-4 h-4" />;
    case 'assign_mediator': return <UserPlus className="w-4 h-4" />;
    case 'mediation_record': return <MessageSquare className="w-4 h-4" />;
    case 'escalate': return <ArrowUp className="w-4 h-4" />;
    case 'resolve': return <CheckCircle className="w-4 h-4" />;
    case 'close': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getTimelineColor = (action: string) => {
  switch (action) {
    case 'register': return 'bg-blue-500';
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

export default function MediationPage() {
  const { 
    mediations, 
    updateMediation, 
    user, 
    addTimelineToMediation, 
    clues, 
    addMessage,
    markRelatedMessagesHandled,
    markRelatedMessagesExpired
  } = useAppStore();
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

  const getRelatedClue = (clueId?: string) => {
    if (!clueId) return null;
    return clues.find(c => c.id === clueId);
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
    addTimelineToMediation(
      selectedMediation.id,
      'assign_mediator',
      user.name,
      `改派调解员为：${assignMediator}`
    );
    markRelatedMessagesHandled(selectedMediation.id, 'mediation');
    markRelatedMessagesExpired(selectedMediation.id, 'mediation');
    addMessage({
      type: 'task',
      typeName: '任务提醒',
      subType: 'mediation_assign',
      title: '新的调解案件指派',
      content: `您被指派为调解案件「${selectedMediation.title}」的调解员，请及时处理。`,
      relatedId: selectedMediation.id,
      relatedType: 'mediation',
      navigatePath: '/mediation',
      sender: '系统',
      receiver: assignMediator,
      priority: 'high',
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
    const wasFailed = selectedMediation.result === 'failed';
    updateMediation(selectedMediation.id, {
      result: 'escalated',
      resultName: '已升级',
      status: 'closed',
      statusName: '已升级上报',
      isEscalatedFromFailed: wasFailed,
    });
    addTimelineToMediation(
      selectedMediation.id,
      'escalate',
      user.name,
      `升级上报，原因：${escalateReason.substring(0, 50)}...`
    );
    markRelatedMessagesHandled(selectedMediation.id, 'mediation');
    markRelatedMessagesExpired(selectedMediation.id, 'mediation');
    addMessage({
      type: 'warning',
      typeName: '预警通知',
      subType: 'mediation_escalate',
      title: '案件升级上报',
      content: `调解案件「${selectedMediation.title}」已升级上报，原因：${escalateReason}`,
      relatedId: selectedMediation.id,
      relatedType: 'mediation',
      navigatePath: '/mediation',
      sender: user.name,
      receiver: '管理员',
      priority: 'high',
    });
    setShowEscalate(false);
    setSelectedMediation(null);
    setEscalateReason('');
  };

  const stats = {
    assigned: mediations.filter(m => m.status === 'assigned').length,
    mediating: mediations.filter(m => m.status === 'mediating').length,
    success: mediations.filter(m => m.result === 'success').length,
    escalated: mediations.filter(m => m.result === 'escalated').length,
  };

  const canEscalate = (m: Mediation) => {
    return m.status !== 'closed' || m.result === 'failed';
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
          <p className="text-3xl font-bold text-yellow-600">{stats.assigned}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">调解中</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.mediating}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">调解成功</p>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.success}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">已升级</p>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.escalated}</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-340px)] min-h-[500px]">
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">案件列表</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mediations.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={cn(
                  "p-4 border-b border-gray-50 cursor-pointer transition-colors",
                  selectedId === m.id ? "bg-blue-50" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{m.title}</h4>
                  <ChevronRight className={cn("w-4 h-4 flex-shrink-0", selectedId === m.id ? "text-blue-600" : "text-gray-400")} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <User className="w-3 h-3" />
                  <span>{m.mediator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    m.status === 'assigned' ? "bg-yellow-100 text-yellow-700" :
                    m.status === 'mediating' ? "bg-blue-100 text-blue-700" :
                    m.result === 'success' ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {m.statusName}
                  </span>
                  {m.deadline && (m.status !== 'completed' && m.status !== 'closed') && (
                    <span className={cn(
                      "text-xs font-medium",
                      isOverdue(m.deadline) ? "text-red-600" :
                      isDeadlineNear(m.deadline) ? "text-orange-600" :
                      "text-gray-500"
                    )}>
                      {getDeadlineText(m.deadline)}
                    </span>
                  )}
                </div>
                {m.deadline && (m.status !== 'completed' && m.status !== 'closed') && (
                  <div className="mt-2">
                    <div className={cn(
                      "h-1 rounded-full",
                      isOverdue(m.deadline) ? "bg-red-100" :
                      isDeadlineNear(m.deadline) ? "bg-orange-100" :
                      "bg-gray-100"
                    )}>
                      <div className={cn(
                        "h-full rounded-full",
                        isOverdue(m.deadline) ? "bg-red-500" :
                        isDeadlineNear(m.deadline) ? "bg-orange-500" :
                        "bg-green-500"
                      )} style={{ width: '100%' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
          {selected ? (
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selected.title}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-full",
                      selected.status === 'assigned' ? "bg-yellow-100 text-yellow-700" :
                      selected.status === 'mediating' ? "bg-blue-100 text-blue-700" :
                      selected.result === 'success' ? "bg-green-100 text-green-700" :
                      selected.result === 'escalated' ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {selected.statusName}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {selected.resultName}
                    </span>
                    {selected.isEscalatedFromFailed && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        调解失败后升级
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status !== 'closed' && (
                    <button
                      onClick={() => openUserPlus(selected)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      改派调解员
                    </button>
                  )}
                  {canEscalate(selected) && (
                    <button
                      onClick={() => openEscalate(selected)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      <ArrowUp className="w-4 h-4" />
                      升级上报
                    </button>
                  )}
                </div>
              </div>

              {selected.clueId && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Link className="w-4 h-4" />
                    <span className="text-sm font-medium">关联线索：</span>
                    <span className="text-sm">{getRelatedClue(selected.clueId)?.title || selected.clueTitle}</span>
                  </div>
                </div>
              )}

              {selected.deadline && selected.status !== 'completed' && selected.status !== 'closed' && (
                <div className={cn(
                  "p-4 rounded-xl",
                  isOverdue(selected.deadline) ? "bg-red-50 border border-red-200" :
                  isDeadlineNear(selected.deadline) ? "bg-orange-50 border border-orange-200" :
                  "bg-gray-50"
                )}>
                  <div className="flex items-center gap-2">
                    {isOverdue(selected.deadline) ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : isDeadlineNear(selected.deadline) ? (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-600" />
                    )}
                    <span className={cn(
                      "font-medium",
                      isOverdue(selected.deadline) ? "text-red-700" :
                      isDeadlineNear(selected.deadline) ? "text-orange-700" :
                      "text-gray-700"
                    )}>
                      {isOverdue(selected.deadline) 
                        ? `已超期，请及时处理！截止时间：${formatDate(selected.deadline)}`
                        : isDeadlineNear(selected.deadline)
                        ? `即将到期，请尽快处理！截止时间：${formatDate(selected.deadline)}`
                        : `调解截止时间：${formatDate(selected.deadline)}`
                      }
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">调解员</p>
                  <p className="text-sm font-medium text-gray-900">{selected.mediator}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">联系电话</p>
                  <p className="text-sm font-medium text-gray-900">{selected.mediatorPhone || '未填写'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">所属区域</p>
                  <p className="text-sm font-medium text-gray-900">{selected.area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">开始时间</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selected.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">结束时间</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selected.endTime ? formatDate(selected.endTime) : '未完成'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selected.createTime)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  当事人信息
                </p>
                <div className="space-y-2">
                  {selected.parties.map((party, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {party.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{party.name}</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                            {party.role === 'plaintiff' ? '申请人' : party.role === 'defendant' ? '被申请人' : '证人'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{party.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.records.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    调解记录
                  </p>
                  <div className="space-y-3">
                    {selected.records.map((record) => (
                      <div key={record.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{formatDate(record.time)}</span>
                          <span className="text-xs text-gray-500">参与人：{record.participants.join('、')}</span>
                        </div>
                        <p className="text-sm text-gray-700">{record.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.agreement && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    调解协议
                  </p>
                  <div className="p-4 bg-green-50 rounded-xl text-sm text-gray-700 border border-green-200">
                    {selected.agreement}
                  </div>
                </div>
              )}

              {selected.followUp && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    回访记录
                  </p>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(selected.followUp.time)} · {selected.followUp.visitor}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn("w-4 h-4", i < selected.followUp!.satisfaction ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{selected.followUp.content}</p>
                    <p className="text-xs text-gray-500 mt-2">评价：{selected.followUp.comment}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  处理时间轴
                </p>
                <Timeline records={selected.timeline || []} />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>请选择一个案件查看详情</p>
            </div>
          )}
        </div>
      </div>

      {showUserPlus && selectedMediation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUserPlus(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">改派调解员</h3>
              <button onClick={() => setShowUserPlus(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">案件：{selectedMediation.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">选择调解员 *</label>
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
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
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
                确认改派
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
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-700">
                  案件：{selectedMediation.title}
                  {selectedMediation.result === 'failed' && (
                    <span className="block mt-1 text-xs text-red-600">调解失败后升级上级处理</span>
                  )}
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
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
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
