import type { Message } from '@/types';
import { getDaysAgo, getRandomItem, getRandomInt, generateId } from '@/utils/format';

const messageTemplates = [
  { type: 'system', title: '系统维护通知', content: '系统将于本周六凌晨2:00-4:00进行维护升级，请提前保存您的工作内容。' },
  { type: 'task', title: '新的调解任务已派单', content: '您有一条新的调解任务已分配，请及时处理。案件编号：M202406001' },
  { type: 'warning', title: '高风险案件预警', content: '线索「农民工工资拖欠问题」被评定为高风险，请立即介入处理。' },
  { type: 'reminder', title: '案件即将超时', content: '调解案件「楼上噪音扰民调解」将于24小时后超时，请尽快处理。' },
  { type: 'task', title: '走访任务提醒', content: '您今日有3条待走访任务，请按时完成。' },
  { type: 'system', title: '数据统计报告已生成', content: '本月矛盾纠纷统计分析报告已生成，请在统计分析页面查看。' },
  { type: 'warning', title: '重点人员预警', content: '重点人员张建国昨日出现异常活动，请网格员及时关注。' },
  { type: 'reminder', title: '回访提醒', content: '案件「停车位纠纷调解」已调解成功，建议3天后进行回访。' },
  { type: 'task', title: '线索待审核', content: '有5条新上报的线索等待您的审核。' },
  { type: 'system', title: '新功能上线通知', content: '地图定位功能已上线，欢迎体验！' },
];

export const mockMessages: Message[] = messageTemplates.map((msg, index) => {
  const types = ['system', 'task', 'warning', 'reminder'] as const;
  const type = msg.type as typeof types[number];
  const priorities = ['low', 'medium', 'high'] as const;
  const priority = type === 'warning' ? 'high' : type === 'task' ? 'medium' : 'low';
  const daysAgo = getRandomInt(0, 7);
  
  const relatedTypeMap: Record<number, 'clue' | 'visit' | 'mediation' | undefined> = {
    0: 'clue',
    1: 'mediation',
    2: 'visit',
  };
  const relatedType = relatedTypeMap[index % 3];
  const navigatePathMap: Record<string, string> = {
    clue: '/clues',
    visit: '/visits',
    mediation: '/mediation',
  };
  
  return {
    id: generateId(),
    type,
    typeName: {
      system: '系统通知',
      task: '任务提醒',
      warning: '预警通知',
      reminder: '超时提醒',
    }[type],
    title: msg.title,
    content: msg.content,
    relatedId: relatedType ? generateId() : undefined,
    relatedType,
    navigatePath: relatedType ? navigatePathMap[relatedType] : undefined,
    sender: '系统管理员',
    receiver: '全体用户',
    isRead: index > 3,
    isHandled: index > 5,
    createTime: getDaysAgo(daysAgo).toISOString(),
    priority,
  };
});
