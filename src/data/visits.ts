import type { Visit, VisitStatus, TimelineRecord } from '@/types';
import { getDaysAgo, getRandomItem, getRandomInt, generateId } from '@/utils/format';
import { AREAS, GRID_WORKERS } from '@/utils/constants';

const statusNames: Record<VisitStatus, string> = {
  pending: '待走访',
  completed: '已完成',
  overdue: '已超期',
};

const visitPurposes = [
  '纠纷线索核实',
  '重点人员走访',
  '矛盾回访',
  '政策宣传',
  '民情收集',
  '安全排查',
];

const addresses = [
  '幸福小区3号楼2单元501',
  '和平花园5栋101室',
  '光明社区文化广场旁民房',
  '新华里12号院3号',
  '人民街88号附5号',
  '建设路56号小区2栋',
  '胜利家园西区6栋',
  '团结巷32号',
];

const visitedPersons = ['张大爷', '李阿姨', '王大哥', '刘大姐', '陈叔叔', '杨阿姨', '赵大哥', '黄大姐'];

export const mockVisits: Visit[] = Array.from({ length: 15 }, (_, index) => {
  const statuses: VisitStatus[] = ['pending', 'completed', 'overdue'];
  const status = index < 3 ? 'pending' as VisitStatus : getRandomItem(statuses);
  const planDaysAgo = getRandomInt(0, 10);
  const planDate = getDaysAgo(status === 'overdue' ? planDaysAgo + 5 : planDaysAgo);
  const visitor = getRandomItem(GRID_WORKERS);
  const purpose = getRandomItem(visitPurposes);
  
  const timeline: TimelineRecord[] = [{
    id: generateId(),
    time: planDate.toISOString(),
    action: 'create_visit',
    actionName: '发起走访',
    operator: visitor,
    description: `创建走访任务，目的：${purpose}`,
  }];
  
  if (status === 'completed') {
    timeline.push({
      id: generateId(),
      time: planDate.toISOString(),
      action: 'complete_visit',
      actionName: '完成走访',
      operator: visitor,
      description: '已完成走访并录入结果',
    });
  }
  
  return {
    id: generateId(),
    title: `${purpose} - ${getRandomItem(visitedPersons)}`,
    planDate: planDate.toISOString(),
    actualDate: status === 'completed' ? planDate.toISOString() : undefined,
    visitor,
    visitedPerson: getRandomItem(visitedPersons),
    visitedAddress: getRandomItem(addresses),
    area: getRandomItem(AREAS),
    purpose,
    content: status === 'completed' 
      ? '走访顺利，了解到当事人近期情绪稳定，纠纷矛盾已初步缓和。建议继续关注，一周后再次回访。' 
      : '',
    photos: [],
    issues: status === 'completed' ? '暂无其他问题' : '',
    status,
    statusName: statusNames[status],
    createTime: planDate.toISOString(),
    timeline,
  };
});
