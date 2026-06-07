import type { Mediation, MediationStatus, MediationResult } from '@/types';
import { getDaysAgo, getRandomItem, getRandomInt, generateId } from '@/utils/format';
import { AREAS, MEDIATORS } from '@/utils/constants';

const statusNames: Record<MediationStatus, string> = {
  assigned: '已派单',
  mediating: '调解中',
  completed: '已完成',
  closed: '已结案',
};

const resultNames: Record<MediationResult, string> = {
  pending: '待调解',
  success: '调解成功',
  failed: '调解失败',
  escalated: '已升级',
};

const mediationTitles = [
  '楼上噪音扰民调解',
  '停车位纠纷调解',
  '物业服务合同纠纷',
  '邻里宅基地边界调解',
  '家庭财产分割调解',
  '劳资纠纷调解',
  '公共区域使用争议',
  '装修扰民纠纷调解',
];

const persons = ['王某', '李某', '张某', '刘某', '陈某', '杨某', '赵某', '黄某'];

export const mockMediations: Mediation[] = mediationTitles.map((title, index) => {
  const statuses: MediationStatus[] = ['assigned', 'mediating', 'completed', 'closed'];
  const results: MediationResult[] = ['pending', 'success', 'failed', 'escalated'];
  const status = index < 3 ? getRandomItem(['assigned', 'mediating'] as MediationStatus[]) : getRandomItem(statuses);
  const result = status === 'completed' || status === 'closed' 
    ? getRandomItem(['success', 'failed', 'escalated'] as MediationResult[]) 
    : 'pending' as MediationResult;
  const daysAgo = getRandomInt(1, 20);
  const startDate = getDaysAgo(daysAgo);
  
  return {
    id: generateId(),
    clueId: generateId(),
    title,
    parties: [
      { name: getRandomItem(persons), phone: `138${getRandomInt(10000000, 99999999)}`, role: 'plaintiff' },
      { name: getRandomItem(persons), phone: `139${getRandomInt(10000000, 99999999)}`, role: 'defendant' },
    ],
    mediator: getRandomItem(MEDIATORS),
    mediatorPhone: `137${getRandomInt(10000000, 99999999)}`,
    startTime: startDate.toISOString(),
    endTime: status === 'completed' || status === 'closed' 
      ? getDaysAgo(daysAgo - getRandomInt(1, 3)).toISOString() 
      : undefined,
    deadline: status !== 'completed' && status !== 'closed'
      ? getDaysAgo(-getRandomInt(1, 10)).toISOString()
      : undefined,
    records: [
      {
        id: generateId(),
        time: startDate.toISOString(),
        content: '第一次调解：双方到场陈述诉求，情绪较为激动，初步了解纠纷情况。',
        participants: [getRandomItem(MEDIATORS), getRandomItem(persons), getRandomItem(persons)],
        attachments: [],
      },
      ...(status !== 'assigned' ? [{
        id: generateId(),
        time: getDaysAgo(daysAgo - 1).toISOString(),
        content: '第二次调解：分别与双方沟通，寻找利益平衡点，提出初步解决方案。',
        participants: [getRandomItem(MEDIATORS), getRandomItem(persons)],
        attachments: [],
      }] : []),
    ],
    result,
    resultName: resultNames[result],
    agreement: result === 'success' 
      ? '双方达成一致意见，同意按照调解协议执行，互不追究对方责任。' 
      : undefined,
    followUp: result === 'success' && status === 'closed' ? {
      time: getDaysAgo(daysAgo - 5).toISOString(),
      visitor: getRandomItem(MEDIATORS),
      content: '回访了解协议履行情况，双方均表示满意。',
      satisfaction: 5 as const,
      comment: '调解员工作认真负责，非常满意',
    } : undefined,
    status,
    statusName: statusNames[status],
    createTime: startDate.toISOString(),
    area: getRandomItem(AREAS),
  };
});
