import { useState } from 'react';
import { 
  Search, 
  User, 
  AlertTriangle, 
  Shield, 
  Eye,
  Edit,
  Ban,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/store';
import { RISK_LEVELS } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/format';

export default function KeyPersons() {
  const { keyPersons } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterBlacklist, setFilterBlacklist] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const filtered = keyPersons.filter(p => {
    const matchSearch = p.name.includes(searchText) || p.address.includes(searchText) || p.tags.some(t => t.includes(searchText));
    const matchRisk = filterRisk === 'all' || p.riskLevel === filterRisk;
    const matchBlacklist = filterBlacklist === 'all' || (filterBlacklist === 'yes' ? p.isBlacklisted : !p.isBlacklisted);
    return matchSearch && matchRisk && matchBlacklist;
  });

  const stats = {
    total: keyPersons.length,
    highRisk: keyPersons.filter(p => p.riskLevel === 'high').length,
    blacklisted: keyPersons.filter(p => p.isBlacklisted).length,
  };

  const selected = keyPersons.find(p => p.id === selectedPerson);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">重点人员</h1>
        <p className="text-gray-500 mt-1">重点关注人员档案管理</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">重点人员总数</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.highRisk}</p>
            <p className="text-sm text-gray-500">高风险人员</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <Ban className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.blacklisted}</p>
            <p className="text-sm text-gray-500">黑名单预警</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、地址、标签..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部风险</option>
              <option value="low">低风险</option>
              <option value="medium">中风险</option>
              <option value="high">高风险</option>
            </select>
            <select
              value={filterBlacklist}
              onChange={(e) => setFilterBlacklist(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="yes">黑名单</option>
              <option value="no">正常</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filtered.map((person) => (
            <div
              key={person.id}
              onClick={() => setSelectedPerson(person.id)}
              className={cn(
                "bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md",
                selectedPerson === person.id 
                  ? "border-blue-500 shadow-md ring-2 ring-blue-100" 
                  : "border-gray-100"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  person.isBlacklisted ? 'bg-red-100' : 
                  person.riskLevel === 'high' ? 'bg-orange-100' : 
                  person.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                )}>
                  <User className={cn(
                    "w-6 h-6",
                    person.isBlacklisted ? 'text-red-600' : 
                    person.riskLevel === 'high' ? 'text-orange-600' : 
                    person.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{person.name}</h4>
                    {person.isBlacklisted && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">
                        黑名单
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {person.gender === 'male' ? '男' : '女'} · {person.age}岁 · {person.area}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {person.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap",
                  RISK_LEVELS[person.riskLevel].bgColor,
                  RISK_LEVELS[person.riskLevel].color
                )}>
                  {RISK_LEVELS[person.riskLevel].label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={cn(
                "px-6 py-5 border-b border-gray-100",
                selected.isBlacklisted 
                  ? 'bg-gradient-to-r from-red-50 to-orange-50' 
                  : selected.riskLevel === 'high'
                  ? 'bg-gradient-to-r from-orange-50 to-yellow-50'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      selected.isBlacklisted ? 'bg-red-200' : 
                      selected.riskLevel === 'high' ? 'bg-orange-200' : 
                      selected.riskLevel === 'medium' ? 'bg-yellow-200' : 'bg-green-200'
                    )}>
                      <User className={cn(
                        "w-8 h-8",
                        selected.isBlacklisted ? 'text-red-700' : 
                        selected.riskLevel === 'high' ? 'text-orange-700' : 
                        selected.riskLevel === 'medium' ? 'text-yellow-700' : 'text-green-700'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-gray-900">{selected.name}</h3>
                        {selected.isBlacklisted && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            黑名单
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {selected.gender === 'male' ? '男' : '女'} · {selected.age}岁
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      联系电话
                    </p>
                    <p className="font-medium text-gray-900">{selected.phone || '暂无'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      涉案次数
                    </p>
                    <p className="font-medium text-gray-900">{selected.caseCount} 次</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      居住地址
                    </p>
                    <p className="font-medium text-gray-900">{selected.address}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      最近联系
                    </p>
                    <p className="font-medium text-gray-900">{selected.lastContactTime ? formatDate(selected.lastContactTime) : '暂无'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">风险等级</p>
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-full",
                      RISK_LEVELS[selected.riskLevel].bgColor,
                      RISK_LEVELS[selected.riskLevel].color
                    )}>
                      {RISK_LEVELS[selected.riskLevel].label}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">人员标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {selected.remark && (
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      备注说明
                    </h4>
                    <p className="text-sm text-yellow-700">{selected.remark}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">跟踪记录</h4>
                  <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
                    {selected.records.map((record) => (
                      <div key={record.id} className="relative">
                        <div className={cn(
                          "absolute -left-[30px] top-0 w-5 h-5 rounded-full border-4 flex items-center justify-center",
                          record.type === 'visit' ? 'bg-white border-blue-500' :
                          record.type === 'mediation' ? 'bg-white border-purple-500' :
                          'bg-white border-red-500'
                        )} />
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              {record.type === 'visit' ? '入户走访' : record.type === 'mediation' ? '调解记录' : '预警提醒'}
                            </span>
                            <span className="text-xs text-gray-400">{formatDate(record.time)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{record.content}</p>
                          <p className="text-xs text-gray-400 mt-2">操作人：{record.operator}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex items-center justify-center py-20">
              <div className="text-center">
                <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">请从左侧选择人员查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
