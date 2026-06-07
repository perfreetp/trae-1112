import ReactECharts from 'echarts-for-react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MapPin
} from 'lucide-react';
import { useAppStore } from '@/store';
import { mockDailyStats, mockTypeStats, mockAreaStats, mockMonthlyTrend } from '@/data/statistics';
import { CHART_COLORS } from '@/utils/constants';
import { formatDate } from '@/utils/format';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgGradient,
  trend,
  trendValue 
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => (
  <div className={`${bgGradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group`}>
    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute right-4 bottom-4 w-20 h-20 bg-white/5 rounded-full" />
    <div className="relative z-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-white/80">{trendValue}</span>
              <span className="text-white/60">较上周</span>
            </div>
          )}
        </div>
        <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm bg-white/20 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { dashboardStats, clues, messages } = useAppStore();
  
  const pendingClues = clues.filter(c => c.status === 'pending' || c.status === 'processing');
  const highRiskClues = clues.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical');
  const overdueWarnings = messages.filter(m => m.type === 'reminder' || m.type === 'warning').slice(0, 5);

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      data: ['本月', '上月'],
      right: 0,
      top: 0,
      textStyle: { fontSize: 12, color: '#6b7280' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: mockDailyStats.map(d => d.date.slice(5)),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    series: [
      {
        name: '本月',
        type: 'line',
        smooth: true,
        data: mockMonthlyTrend.thisMonth,
        lineStyle: { color: CHART_COLORS[0], width: 3 },
        itemStyle: { color: CHART_COLORS[0] },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 93, 255, 0.25)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.02)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '上月',
        type: 'line',
        smooth: true,
        data: mockMonthlyTrend.lastMonth,
        lineStyle: { color: CHART_COLORS[5], width: 2, type: 'dashed' },
        itemStyle: { color: CHART_COLORS[5] },
        symbol: 'circle',
        symbolSize: 4
      }
    ]
  };

  const pieOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 12, color: '#6b7280' }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' }
      },
      data: mockTypeStats.map((item, index) => ({
        value: item.count,
        name: item.typeName,
        itemStyle: { color: CHART_COLORS[index % CHART_COLORS.length] }
      }))
    }]
  };

  const barOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: mockAreaStats.map(a => a.area),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#9ca3af', fontSize: 10, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: mockAreaStats.map(a => a.count),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#165DFF' },
            { offset: 1, color: '#69b1ff' }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '50%'
    }]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">风险总览</h1>
        <p className="text-gray-500 mt-1">欢迎回来，这是今日的矛盾纠纷风险概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="线索总数"
          value={dashboardStats.totalClues}
          icon={FileText}
          color="bg-blue-500/30"
          bgGradient="bg-gradient-to-br from-blue-600 to-blue-500"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="待处理案件"
          value={dashboardStats.pendingClues}
          icon={Clock}
          color="bg-orange-500/30"
          bgGradient="bg-gradient-to-br from-orange-500 to-amber-500"
          trend="down"
          trendValue="-8%"
        />
        <StatCard
          title="调解成功率"
          value={`${dashboardStats.successRate}%`}
          icon={CheckCircle}
          color="bg-green-500/30"
          bgGradient="bg-gradient-to-br from-green-500 to-emerald-500"
          trend="up"
          trendValue="+5%"
        />
        <StatCard
          title="高风险案件"
          value={dashboardStats.highRisk}
          icon={AlertTriangle}
          color="bg-red-500/30"
          bgGradient="bg-gradient-to-br from-red-500 to-rose-500"
          trend="up"
          trendValue="+2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">案件趋势</h3>
              <p className="text-sm text-gray-500">近30天案件数量变化</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>本月新增 {mockMonthlyTrend.thisMonth.reduce((a, b) => a + b, 0)} 件</span>
            </div>
          </div>
          <ReactECharts option={trendOption} style={{ height: '300px' }} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">纠纷类型分布</h3>
          <ReactECharts option={pieOption} style={{ height: '280px' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">各社区案件统计</h3>
          <ReactECharts option={barOption} style={{ height: '300px' }} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">预警提醒</h3>
            <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
              {overdueWarnings.length} 条待处理
            </span>
          </div>
          <div className="space-y-3">
            {overdueWarnings.map((warning) => (
              <div 
                key={warning.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className={
                  warning.type === 'warning' 
                    ? 'w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0'
                    : 'w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0'
                }>
                  <AlertTriangle className={
                    warning.type === 'warning' ? 'w-4 h-4 text-red-600' : 'w-4 h-4 text-orange-600'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{warning.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{warning.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(warning.createTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">待处理线索</h3>
            <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">查看全部</span>
          </div>
          <div className="space-y-3">
            {pendingClues.slice(0, 5).map((clue) => (
              <div 
                key={clue.id}
                className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{clue.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{clue.area}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-xs text-gray-500">{clue.typeName}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  clue.riskLevel === 'high' || clue.riskLevel === 'critical'
                    ? 'bg-red-100 text-red-600'
                    : clue.riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {clue.riskLevel === 'critical' ? '紧急' : clue.riskLevel === 'high' ? '高风险' : clue.riskLevel === 'medium' ? '中风险' : '低风险'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">重点人员关注</h3>
            <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">查看全部</span>
          </div>
          <div className="space-y-3">
            {useAppStore.getState().keyPersons.slice(0, 5).map((person) => (
              <div 
                key={person.id}
                className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  person.isBlacklisted ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                  <Users className={`w-5 h-5 ${
                    person.isBlacklisted ? 'text-red-600' : 'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    {person.isBlacklisted && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">黑名单</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {person.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  person.riskLevel === 'high'
                    ? 'bg-red-100 text-red-600'
                    : person.riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {person.riskLevel === 'high' ? '高风险' : person.riskLevel === 'medium' ? '中风险' : '低风险'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
