import type { DailyStats, TypeStats, AreaStats, DashboardStats } from '@/types';
import { getDaysAgo, formatDate } from '@/utils/format';
import { CLUE_TYPES, AREAS } from '@/utils/constants';

export const mockDailyStats: DailyStats[] = Array.from({ length: 30 }, (_, i) => {
  const date = getDaysAgo(29 - i);
  return {
    date: formatDate(date),
    clueCount: Math.floor(Math.random() * 10) + 2,
    mediationCount: Math.floor(Math.random() * 6) + 1,
    resolvedCount: Math.floor(Math.random() * 5) + 1,
    visitCount: Math.floor(Math.random() * 8) + 3,
  };
});

export const mockTypeStats: TypeStats[] = Object.entries(CLUE_TYPES).map(([type, typeName]) => ({
  type,
  typeName,
  count: Math.floor(Math.random() * 30) + 5,
  percentage: 0,
}));

const total = mockTypeStats.reduce((sum, item) => sum + item.count, 0);
mockTypeStats.forEach(item => {
  item.percentage = Math.round((item.count / total) * 100);
});

export const mockAreaStats: AreaStats[] = AREAS.map(area => {
  const count = Math.floor(Math.random() * 25) + 5;
  const resolvedCount = Math.floor(count * (0.6 + Math.random() * 0.3));
  return {
    area,
    count,
    resolvedCount,
    rate: Math.round((resolvedCount / count) * 100),
  };
});

export const mockDashboardStats: DashboardStats = {
  totalClues: 128,
  pendingClues: 23,
  todayNew: 5,
  successRate: 82,
  keyPersons: 42,
  highRisk: 8,
  overdue: 3,
  totalMediation: 86,
  pendingVisits: 12,
  pendingMediations: 8,
  nearDeadlineVisits: 3,
  nearDeadlineMediations: 2,
  overdueVisits: 2,
  overdueMediations: 1,
  unhandledMessages: 5,
};

export const mockMonthlyTrend = {
  thisMonth: [12, 15, 18, 14, 16, 20, 22, 18, 15, 17, 19, 21, 23, 20, 18, 16, 19, 22, 25, 23, 21, 19, 17, 20, 22, 24, 26, 23, 21, 19],
  lastMonth: [10, 12, 14, 16, 13, 15, 18, 16, 14, 12, 15, 17, 19, 17, 15, 13, 16, 18, 20, 18, 16, 14, 12, 15, 17, 19, 21, 18, 16, 14],
};
