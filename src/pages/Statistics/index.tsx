import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  Download, 
  Calendar, 
  TrendingUp,
  FileDown,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { mockDailyStats, mockTypeStats, mockAreaStats, mockMonthlyTrend } from '@/data/statistics';
import { CHART_COLORS, CLUE_TYPES } from '@/utils/constants';
import * as XLSX from 'xlsx';
import { formatDate } from '@/utils/format';

export default function Statistics() {
  const [dateRange, setDateRange] = useState('month');
  const [chartType, setChartType] = useState('trend');

  const handleExport = () => {
    const data = mockDailyStats.map(item => ({
      '日期': item.date,
      '新增线索': item.clueCount,
      '调解案件': item.mediationCount,
      '化解案件': item.resolvedCount,
      '走访次数': item.visitCount,
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '矛盾纠纷统计');
    XLSX.writeFile(wb, `矛盾纠纷统计报表_${formatDate(new Date())}.xlsx`);
  };

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      data: ['新增线索', '调解案件', '化解案件', '走访次数'],
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
        name: '新增线索',
        type: 'line',
        smooth: true,
        data: mockDailyStats.map(d => d.clueCount),
        lineStyle: { color: CHART_COLORS[0], width: 3 },
        itemStyle: { color: CHART_COLORS[0] },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22, 93, 255, 0.2)' }, { offset: 1, color: 'rgba(22, 93, 255, 0.02)' }] } },
        symbol: 'circle',
        symbolSize: 5
      },
      {
        name: '调解案件',
        type: 'line',
        smooth: true,
        data: mockDailyStats.map(d => d.mediationCount),
        lineStyle: { color: CHART_COLORS[1], width: 2 },
        itemStyle: { color: CHART_COLORS[1] },
        symbol: 'circle',
        symbolSize: 4
      },
      {
        name: '化解案件',
        type: 'line',
        smooth: true,
        data: mockDailyStats.map(d => d.resolvedCount),
        lineStyle: { color: CHART_COLORS[2], width: 2 },
        itemStyle: { color: CHART_COLORS[2] },
        symbol: 'circle',
        symbolSize: 4
      },
      {
        name: '走访次数',
        type: 'line',
        smooth: true,
        data: mockDailyStats.map(d => d.visitCount),
        lineStyle: { color: CHART_COLORS[3], width: 2 },
        itemStyle: { color: CHART_COLORS[3] },
        symbol: 'circle',
        symbolSize: 4
      }
    ]
  };

  const typePieOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: '{b}: {c}件 ({d}%)'
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
      radius: ['50%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
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

  const areaBarOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['案件总数', '已化解'],
      top: 0,
      textStyle: { fontSize: 12, color: '#6b7280' }
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '12%', containLabel: true },
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
    series: [
      {
        name: '案件总数',
        type: 'bar',
        data: mockAreaStats.map(a => a.count),
        itemStyle: { color: CHART_COLORS[0], borderRadius: [4, 4, 0, 0] },
        barWidth: '35%'
      },
      {
        name: '已化解',
        type: 'bar',
        data: mockAreaStats.map(a => a.resolvedCount),
        itemStyle: { color: CHART_COLORS[1], borderRadius: [4, 4, 0, 0] },
        barWidth: '35%'
      }
    ]
  };

  const compareOption = {
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
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#9ca3af', fontSize: 10 }
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
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22, 93, 255, 0.25)' }, { offset: 1, color: 'rgba(22, 93, 255, 0.02)' }] } },
        symbol: 'circle',
        symbolSize: 5
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

  const totalClues = mockDailyStats.reduce((sum, d) => sum + d.clueCount, 0);
  const totalMediation = mockDailyStats.reduce((sum, d) => sum + d.mediationCount, 0);
  const totalResolved = mockDailyStats.reduce((sum, d) => sum + d.resolvedCount, 0);
  const successRate = Math.round((totalResolved / totalClues) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计分析</h1>
          <p className="text-gray-500 mt-1">多维度数据分析与报表导出</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {range === 'week' ? '本周' : range === 'month' ? '本月' : range === 'quarter' ? '本季度' : '本年'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            <FileDown className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">新增线索</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalClues}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5%</span>
            <span className="text-gray-400">环比</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">调解案件</p>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalMediation}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+8.3%</span>
            <span className="text-gray-400">环比</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">成功化解</p>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalResolved}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+15.2%</span>
            <span className="text-gray-400">环比</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">调解成功率</p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{successRate}%</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+3.1%</span>
            <span className="text-gray-400">环比</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'trend', label: '趋势分析', icon: LineChart },
          { key: 'type', label: '类型分布', icon: PieChart },
          { key: 'area', label: '区域统计', icon: BarChart3 },
          { key: 'compare', label: '趋势对比', icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setChartType(item.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                chartType === item.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {chartType === 'trend' && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">矛盾纠纷趋势分析</h3>
            <ReactECharts option={trendOption} style={{ height: '400px' }} />
          </>
        )}
        {chartType === 'type' && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">纠纷类型分布</h3>
            <ReactECharts option={typePieOption} style={{ height: '400px' }} />
          </>
        )}
        {chartType === 'area' && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">各社区案件统计</h3>
            <ReactECharts option={areaBarOption} style={{ height: '400px' }} />
          </>
        )}
        {chartType === 'compare' && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">月度趋势对比</h3>
            <ReactECharts option={compareOption} style={{ height: '400px' }} />
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">各社区化解率排行</h3>
        <div className="space-y-4">
          {mockAreaStats.sort((a, b) => b.rate - a.rate).map((area, idx) => (
            <div key={area.area} className="flex items-center gap-4">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                idx === 1 ? 'bg-gray-200 text-gray-700' :
                idx === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{area.area}</span>
                  <span className="text-sm text-gray-500">{area.resolvedCount}/{area.count}件</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${area.rate}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-blue-600 w-12 text-right">{area.rate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
