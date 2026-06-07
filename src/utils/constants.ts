export const CLUE_TYPES: Record<string, string> = {
  neighbor: '邻里纠纷',
  property: '物业纠纷',
  family: '家庭纠纷',
  labor: '劳资纠纷',
  other: '其他纠纷',
};

export const RISK_LEVELS: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: '低风险', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { label: '中风险', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: '高风险', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  critical: { label: '紧急风险', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const CLUE_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待处理', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  processing: { label: '处理中', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  mediating: { label: '调解中', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  resolved: { label: '已化解', color: 'text-green-600', bgColor: 'bg-green-100' },
  closed: { label: '已归档', color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export const VISIT_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待走访', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-100' },
  overdue: { label: '已超期', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const MEDIATION_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  assigned: { label: '已派单', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  mediating: { label: '调解中', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-100' },
  closed: { label: '已结案', color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export const MEDIATION_RESULT: Record<string, { label: string; color: string }> = {
  pending: { label: '待调解', color: 'text-gray-600' },
  success: { label: '调解成功', color: 'text-green-600' },
  failed: { label: '调解失败', color: 'text-red-600' },
  escalated: { label: '已升级', color: 'text-orange-600' },
};

export const MESSAGE_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  system: { label: '系统通知', color: 'text-blue-600', icon: 'Bell' },
  task: { label: '任务提醒', color: 'text-yellow-600', icon: 'ClipboardList' },
  warning: { label: '预警通知', color: 'text-red-600', icon: 'AlertTriangle' },
  reminder: { label: '超时提醒', color: 'text-orange-600', icon: 'Clock' },
};

export const AREAS = [
  '幸福社区',
  '和平社区',
  '光明社区',
  '新华社区',
  '人民社区',
  '建设社区',
  '胜利社区',
  '团结社区',
];

export const GRID_WORKERS = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '钱七',
  '孙八',
];

export const MEDIATORS = [
  '陈调解',
  '刘调解',
  '周调解',
  '吴调解',
  '郑调解',
];

export const CHART_COLORS = [
  '#165DFF',
  '#00B42A',
  '#FF7D00',
  '#F53F3F',
  '#722ED1',
  '#86909C',
  '#14C9C9',
  '#F7BA1E',
];
