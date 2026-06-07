import type { KeyPerson, RiskLevel } from '@/types';
import { getDaysAgo, getRandomItem, getRandomInt, generateId } from '@/utils/format';
import { AREAS, GRID_WORKERS } from '@/utils/constants';

const personNames = ['张建国', '李淑华', '王志强', '刘桂英', '陈大明', '杨秀珍', '赵永安', '黄素芬', '周德明', '吴春梅'];
const tags = ['多次上访', '情绪不稳', '邻里矛盾', '家庭纠纷', '有暴力倾向', '精神病史', '社区矫正', '重点关注'];
const addresses = [
  '幸福小区3号楼2单元501',
  '和平花园5栋101室',
  '光明社区文化广场旁',
  '新华里12号院3号',
  '人民街88号附5号',
  '建设路56号小区2栋',
  '胜利家园西区6栋',
  '团结巷32号',
];

export const mockKeyPersons: KeyPerson[] = personNames.map((name, index) => {
  const riskLevels: Exclude<RiskLevel, 'critical'>[] = ['low', 'medium', 'high'];
  const daysAgo = getRandomInt(0, 60);
  
  return {
    id: generateId(),
    name,
    gender: index % 2 === 0 ? 'male' : 'female',
    age: getRandomInt(35, 75),
    idCard: `51010${getRandomInt(1950, 2000)}${String(getRandomInt(100000, 999999)).padStart(6, '0')}`,
    phone: `13${getRandomInt(5, 9)}${String(getRandomInt(10000000, 99999999)).padStart(8, '0')}`,
    address: getRandomItem(addresses),
    area: getRandomItem(AREAS),
    tags: [getRandomItem(tags), getRandomItem(tags)],
    riskLevel: getRandomItem(riskLevels),
    caseCount: getRandomInt(1, 8),
    lastContactTime: getDaysAgo(daysAgo).toISOString(),
    remark: index % 3 === 0 ? '需重点关注，定期回访' : '',
    isBlacklisted: index % 5 === 0,
    createTime: getDaysAgo(getRandomInt(30, 365)).toISOString(),
    records: [
      {
        id: generateId(),
        time: getDaysAgo(daysAgo).toISOString(),
        type: 'visit',
        content: '入户走访，了解近期生活状况，情绪稳定。',
        operator: getRandomItem(GRID_WORKERS),
      },
      {
        id: generateId(),
        time: getDaysAgo(daysAgo + 15).toISOString(),
        type: 'mediation',
        content: '参与邻里纠纷调解，态度较好。',
        operator: getRandomItem(GRID_WORKERS),
      },
    ],
  };
});
