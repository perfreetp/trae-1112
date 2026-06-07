import { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  ArrowRight,
  Handshake,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/store';
import { MEDIATION_STATUS, MEDIATION_RESULT } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/format';

export default function Mediation() {
  const { mediations } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const filtered = mediations.filter(m => {
    const matchSearch = m.title.includes(searchText) || 
                        m.mediator.includes(searchText) ||
                        m.parties.some(p => p.name.includes(searchText));
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    assigned: mediations.filter(m => m.status === 'assigned').length,
    mediating: mediations.filter(m => m.status === 'mediating').length,
    completed: mediations.filter(m => m.status === 'completed').length,
    closed: mediations.filter(m => m.status === 'closed').length,
  };

  const selectedMediation = mediations.find(m => m.id === selectedCase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">调解流转</h1>
        <p className="text-gray-500 mt-1">管理调解案件全流程</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
          </div>
          <p className="text-sm text-gray-500">已派单</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.mediating}</p>
          </div>
          <p className="text-sm text-gray-500">调解中</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <p className="text-sm text-gray-500">已完成</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
          </div>
          <p className="text-sm text-gray-500">已结案</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索案件标题、调解员、当事人..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'assigned', 'mediating', 'completed', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {status === 'all' ? '全部' : MEDIATION_STATUS[status as keyof typeof MEDIATION_STATUS].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedCase(m.id)}
              className={cn(
                "bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md",
                selectedCase === m.id 
                  ? "border-blue-500 shadow-md ring-2 ring-blue-100" 
                  : "border-gray-100"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{m.title}</h4>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ml-2",
                  MEDIATION_STATUS[m.status].bgColor,
                  MEDIATION_STATUS[m.status].color
                )}>
                  {MEDIATION_STATUS[m.status].label}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  <span>调解员：{m.mediator}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>开始：{formatDate(m.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={MEDIATION_RESULT[m.result].color}>
                    {MEDIATION_RESULT[m.result].label}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{m.area}</span>
                </div>
              </div>
              {m.deadline && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">截止：{formatDate(m.deadline)}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedMediation ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMediation.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">案件编号：{selectedMediation.id.toUpperCase().slice(0, 12)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 text-sm font-medium rounded-full",
                      MEDIATION_STATUS[selectedMediation.status].bgColor,
                      MEDIATION_STATUS[selectedMediation.status].color
                    )}>
                      {MEDIATION_STATUS[selectedMediation.status].label}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">调解员</p>
                    <p className="font-medium text-gray-900">{selectedMediation.mediator}</p>
                    {selectedMediation.mediatorPhone && (
                      <p className="text-sm text-gray-500">{selectedMediation.mediatorPhone}</p>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">所属区域</p>
                    <p className="font-medium text-gray-900">{selectedMediation.area}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">开始时间</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedMediation.startTime)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">调解结果</p>
                    <p className={cn("font-medium", MEDIATION_RESULT[selectedMediation.result].color)}>
                      {MEDIATION_RESULT[selectedMediation.result].label}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">当事人信息</h4>
                  <div className="space-y-2">
                    {selectedMediation.parties.map((party, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{party.name}</p>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-white text-gray-500">
                              {party.role === 'plaintiff' ? '申请人' : party.role === 'defendant' ? '被申请人' : '证人'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{party.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">调解记录</h4>
                  <div className="relative pl-6 border-l-2 border-gray-100 space-y-5">
                    {selectedMediation.records.map((record, idx) => (
                      <div key={record.id} className="relative">
                        <div className="absolute -left-[30px] top-0 w-5 h-5 rounded-full bg-white border-4 border-blue-500" />
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-blue-600">第{idx + 1}次调解</span>
                            <span className="text-xs text-gray-400">{formatDate(record.time)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{record.content}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {record.participants.map((p, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-white rounded text-gray-500">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedMediation.agreement && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      调解协议
                    </h4>
                    <p className="text-sm text-green-700">{selectedMediation.agreement}</p>
                  </div>
                )}

                {selectedMediation.followUp && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">回访记录</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-700">{selectedMediation.followUp.content}</p>
                      <div className="flex items-center gap-4 text-xs text-blue-600">
                        <span>回访人：{selectedMediation.followUp.visitor}</span>
                        <span>满意度：
                          <span className="text-yellow-500">
                            {'★'.repeat(selectedMediation.followUp.satisfaction)}
                            {'☆'.repeat(5 - selectedMediation.followUp.satisfaction)}
                          </span>
                        </span>
                      </div>
                      {selectedMediation.followUp.comment && (
                        <p className="text-xs text-blue-600 italic">"{selectedMediation.followUp.comment}"</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex items-center justify-center py-20">
              <div className="text-center">
                <Handshake className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">请从左侧选择案件查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
