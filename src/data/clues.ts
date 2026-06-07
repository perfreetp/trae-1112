import type { Clue, ClueType, RiskLevel, ClueStatus, TimelineRecord } from '@/types';
import { getDaysAgo, getRandomItem, getRandomInt, generateId } from '@/utils/format';
import { CLUE_TYPES, AREAS, GRID_WORKERS } from '@/utils/constants';

const clueTypes = Object.keys(CLUE_TYPES) as ClueType[];
const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
const statuses: ClueStatus[] = ['pending', 'processing', 'mediating', 'resolved', 'closed'];

const statusNames: Record<ClueStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  mediating: '调解中',
  resolved: '已化解',
  closed: '已归档',
};

const clueTitles = [
  '楼上住户噪音扰民引发纠纷',
  '小区停车位分配争议',
  '物业服务不到位业主拒交物业费',
  '邻里宅基地边界争议',
  '家庭财产继承纠纷',
  '农民工工资拖欠问题',
  '小区公共区域占用问题',
  '装修施工扰民投诉',
  '宠物伤人赔偿纠纷',
  '供水管道维修费用分摊',
  '小区广告收益分配争议',
  '旧楼加装电梯意见分歧',
  '邻里采光通风纠纷',
  '餐饮店油烟扰民投诉',
  '业主与业委会矛盾',
  '房屋漏水维修责任争议',
  '广场舞噪音扰民',
  '垃圾清运不及时引发不满',
  '小区绿化被破坏',
  '停车位被占引发冲突',
];

const locations = [
  '幸福小区3号楼2单元',
  '和平花园5栋101室',
  '光明社区文化广场旁',
  '新华里12号院',
  '人民街88号',
  '建设路56号小区',
  '胜利家园西区',
  '团结巷32号',
  '幸福社区便民服务中心',
  '和平路菜市场旁',
];

const persons = ['王某', '李某', '张某', '刘某', '陈某', '杨某', '赵某', '黄某', '周某', '吴某'];

export const mockClues: Clue[] = clueTitles.map((title, index) => {
  const type = getRandomItem(clueTypes);
  const pendingStatuses: ClueStatus[] = ['pending', 'processing'];
  const status = index < 5 ? getRandomItem(pendingStatuses) : getRandomItem(statuses);
  const daysAgo = getRandomInt(0, 30);
  const createDate = getDaysAgo(daysAgo);
  const riskLevel = getRandomItem(riskLevels);
  const reporter = getRandomItem(GRID_WORKERS);
  
  const timeline: TimelineRecord[] = [{
    id: generateId(),
    time: createDate.toISOString(),
    action: 'register',
    actionName: '线索登记',
    operator: reporter,
    description: `网格员上报线索：${title}`,
  }];
  
  if (status === 'processing' || status === 'mediating' || status === 'resolved') {
    timeline.push({
      id: generateId(),
      time: getDaysAgo(daysAgo - 1).toISOString(),
      action: 'create_visit',
      actionName: '发起走访',
      operator: getRandomItem(GRID_WORKERS),
      description: '已安排网格员入户走访核实情况',
    });
  }
  
  if (status === 'mediating' || status === 'resolved') {
    timeline.push({
      id: generateId(),
      time: getDaysAgo(daysAgo - 3).toISOString(),
      action: 'create_mediation',
      actionName: '转入调解',
      operator: '综治中心',
      description: '已转入调解程序，安排调解员跟进',
    });
  }
  
  if (status === 'resolved') {
    timeline.push({
      id: generateId(),
      time: getDaysAgo(daysAgo - 5).toISOString(),
      action: 'resolve',
      actionName: '调解成功',
      operator: getRandomItem(GRID_WORKERS),
      description: '双方达成一致，纠纷成功化解',
    });
  }
  
  return {
    id: generateId(),
    title,
    type,
    typeName: CLUE_TYPES[type],
    description: `${title}，双方各执一词，情绪较为激动，需要社区介入调解。涉及多方利益，情况较为复杂，建议尽快处理。`,
    location: getRandomItem(locations),
    area: getRandomItem(AREAS),
    latitude: 30.2741 + Math.random() * 0.1,
    longitude: 120.1551 + Math.random() * 0.1,
    involvedPersons: [getRandomItem(persons), getRandomItem(persons)],
    reporter,
    reporterPhone: `138${getRandomInt(10000000, 99999999)}`,
    riskLevel,
    status,
    statusName: statusNames[status],
    createTime: createDate.toISOString(),
    updateTime: getDaysAgo(daysAgo - 5).toISOString(),
    assignee: status !== 'pending' ? getRandomItem(GRID_WORKERS) : undefined,
    deadline: status !== 'resolved' && status !== 'closed' 
      ? getDaysAgo(-getRandomInt(1, 7)).toISOString() 
      : undefined,
    attachments: [],
    isDuplicate: index % 7 === 0,
    mergedFrom: index % 7 === 0 ? [generateId()] : undefined,
    timeline,
  };
});
