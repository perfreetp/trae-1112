import { create } from 'zustand';
import type { 
  Clue, 
  Visit, 
  Mediation, 
  KeyPerson, 
  Message, 
  DashboardStats, 
  User, 
  TimelineRecord,
  TimelineActionType,
  MergedInfo,
  MessageType,
  MessageSubType
} from '@/types';
import { mockClues } from '@/data/clues';
import { mockVisits } from '@/data/visits';
import { mockMediations } from '@/data/mediation';
import { mockKeyPersons } from '@/data/keyPersons';
import { mockMessages } from '@/data/messages';
import { mockDashboardStats } from '@/data/statistics';
import { generateId } from '@/utils/format';

const actionNames: Record<TimelineActionType, string> = {
  register: '线索登记',
  merge: '线索合并',
  create_visit: '发起走访',
  complete_visit: '完成走访',
  create_mediation: '转入调解',
  assign_mediator: '指派调解员',
  mediation_record: '调解记录',
  escalate: '升级上报',
  follow_up: '回访登记',
  resolve: '调解成功',
  close: '结案归档',
};

const messageSubTypeNames: Record<MessageSubType, string> = {
  visit_assign: '走访派单',
  visit_near_deadline: '走访临近截止',
  visit_overdue: '走访已超期',
  mediation_assign: '调解派单',
  mediation_near_deadline: '调解临近截止',
  mediation_overdue: '调解已超期',
  mediation_escalate: '调解升级上报',
  clue_escalate: '线索升级上报',
  system_notice: '系统通知',
};

interface AppState {
  user: User;
  clues: Clue[];
  visits: Visit[];
  mediations: Mediation[];
  keyPersons: KeyPerson[];
  messages: Message[];
  dashboardStats: DashboardStats;
  sidebarCollapsed: boolean;
  currentPage: string;
  
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  addClue: (clue: Clue) => void;
  updateClue: (id: string, data: Partial<Clue>) => void;
  deleteClue: (id: string) => void;
  mergeClues: (targetId: string, sourceIds: string[], operator: string) => void;
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, data: Partial<Visit>) => void;
  addMediation: (mediation: Mediation) => void;
  updateMediation: (id: string, data: Partial<Mediation>) => void;
  createVisitFromClue: (clueId: string, visitData: Partial<Visit>, operator: string) => string;
  createMediationFromClue: (clueId: string, mediationData: Partial<Mediation>, operator: string) => string;
  completeVisit: (visitId: string, data: Partial<Visit>, operator: string) => void;
  addTimelineToClue: (clueId: string, action: TimelineActionType, operator: string, description: string, relatedId?: string, relatedType?: 'clue' | 'visit' | 'mediation') => void;
  addTimelineToVisit: (visitId: string, action: TimelineActionType, operator: string, description: string, relatedId?: string, relatedType?: 'clue' | 'visit' | 'mediation') => void;
  addTimelineToMediation: (mediationId: string, action: TimelineActionType, operator: string, description: string, relatedId?: string, relatedType?: 'clue' | 'visit' | 'mediation') => void;
  addMessage: (message: Omit<Message, 'id' | 'createTime' | 'isRead' | 'isHandled' | 'isExpired'>) => void;
  markMessageRead: (id: string) => void;
  markMessageHandled: (id: string) => void;
  markAllMessagesRead: () => void;
  markAllMessagesHandled: () => void;
  markRelatedMessagesHandled: (relatedId: string, relatedType: 'visit' | 'mediation') => void;
  markRelatedMessagesExpired: (relatedId: string, relatedType: 'visit' | 'mediation') => void;
  generateReminderMessages: () => void;
  getVisitsByClueId: (clueId: string) => Visit[];
  getMediationsByClueId: (clueId: string) => Mediation[];
  getMessagesByRelatedId: (relatedId: string, relatedType?: 'clue' | 'visit' | 'mediation') => Message[];
  refreshDashboardStats: () => void;
}

const createTimelineRecord = (
  action: TimelineActionType,
  operator: string,
  description: string,
  relatedId?: string,
  relatedType?: 'clue' | 'visit' | 'mediation'
): TimelineRecord => ({
  id: generateId(),
  time: new Date().toISOString(),
  action,
  actionName: actionNames[action],
  operator,
  description,
  relatedId,
  relatedType,
});

const messageTypeNames: Record<MessageType, string> = {
  system: '系统通知',
  task: '任务提醒',
  warning: '预警通知',
  reminder: '到期提醒',
};

const computeDashboardStats = (clues: Clue[], visits: Visit[], mediations: Mediation[], messages: Message[]): DashboardStats => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const threeDays = 3 * oneDay;

  const nearDeadlineVisits = visits.filter(v => {
    if (v.status === 'completed' || !v.planDate) return false;
    const diff = new Date(v.planDate).getTime() - now;
    return diff > 0 && diff <= threeDays;
  }).length;

  const overdueVisits = visits.filter(v => {
    if (v.status === 'completed' || !v.planDate) return false;
    return new Date(v.planDate).getTime() < now;
  }).length;

  const nearDeadlineMediations = mediations.filter(m => {
    if (m.status === 'closed' || m.status === 'completed' || !m.deadline) return false;
    const diff = new Date(m.deadline).getTime() - now;
    return diff > 0 && diff <= threeDays;
  }).length;

  const overdueMediations = mediations.filter(m => {
    if (m.status === 'closed' || m.status === 'completed' || !m.deadline) return false;
    return new Date(m.deadline).getTime() < now;
  }).length;

  return {
    totalClues: clues.length,
    pendingClues: clues.filter(c => c.status === 'pending').length,
    todayNew: clues.filter(c => {
      const createDate = new Date(c.createTime).toDateString();
      return createDate === new Date().toDateString();
    }).length,
    successRate: mediations.length > 0 
      ? Math.round((mediations.filter(m => m.result === 'success').length / mediations.length) * 100) 
      : 0,
    keyPersons: mockKeyPersons.length,
    highRisk: clues.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length,
    overdue: overdueVisits + overdueMediations,
    totalMediation: mediations.length,
    pendingVisits: visits.filter(v => v.status === 'pending').length,
    pendingMediations: mediations.filter(m => m.status === 'assigned' || m.status === 'mediating').length,
    nearDeadlineVisits,
    nearDeadlineMediations,
    overdueVisits,
    overdueMediations,
    unhandledMessages: messages.filter(m => !m.isHandled).length,
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  user: {
    id: '1',
    name: '管理员',
    role: 'admin',
    roleName: '街道综治中心',
    phone: '13800138000',
    area: '全区',
  },
  clues: mockClues,
  visits: mockVisits,
  mediations: mockMediations,
  keyPersons: mockKeyPersons,
  messages: mockMessages,
  dashboardStats: mockDashboardStats,
  sidebarCollapsed: false,
  currentPage: 'dashboard',

  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  addClue: (clue) => set((state) => { 
    const newClues = [clue, ...state.clues];
    return {
      clues: newClues,
      dashboardStats: computeDashboardStats(newClues, state.visits, state.mediations, state.messages),
    };
  }),
  
  updateClue: (id, data) => set((state) => {
    const newClues = state.clues.map((clue) => 
      clue.id === id ? { ...clue, ...data, updateTime: new Date().toISOString() } : clue
    );
    return {
      clues: newClues,
      dashboardStats: computeDashboardStats(newClues, state.visits, state.mediations, state.messages),
    };
  }),
  
  deleteClue: (id) => set((state) => {
    const newClues = state.clues.filter((clue) => clue.id !== id);
    return {
      clues: newClues,
      dashboardStats: computeDashboardStats(newClues, state.visits, state.mediations, state.messages),
    };
  }),
  
  mergeClues: (targetId, sourceIds, operator) => set((state) => {
    const targetClue = state.clues.find(c => c.id === targetId);
    if (!targetClue) return state;
    
    const sourceClues = state.clues.filter(c => sourceIds.includes(c.id));
    const mergedDescriptions = [targetClue.description, ...sourceClues.map(c => c.description)].filter(Boolean).join('\n\n---\n\n');
    const mergedInvolved = [...new Set([...targetClue.involvedPersons, ...sourceClues.flatMap(c => c.involvedPersons)])];
    const mergedAttachments = [...targetClue.attachments, ...sourceClues.flatMap(c => c.attachments)];
    const mergedInfos: MergedInfo[] = [
      ...(targetClue.mergedInfos || []),
      ...sourceClues.map(sc => ({
        sourceId: sc.id,
        sourceTitle: sc.title,
        sourceLocation: sc.location,
        mergeTime: new Date().toISOString(),
      })),
    ];
    
    const mergeTimeline = createTimelineRecord(
      'merge',
      operator,
      `合并了 ${sourceClues.length} 条重复线索：${sourceClues.map(s => s.title).join('、')}`,
      targetId,
      'clue'
    );
    
    const newClues = state.clues
      .filter(c => !sourceIds.includes(c.id))
      .map(clue => 
        clue.id === targetId 
          ? {
              ...clue,
              description: mergedDescriptions,
              involvedPersons: mergedInvolved,
              attachments: mergedAttachments,
              mergedFrom: sourceIds,
              mergedInfos,
              isDuplicate: false,
              updateTime: new Date().toISOString(),
              timeline: [...clue.timeline, mergeTimeline],
            }
          : clue
      );

    return {
      clues: newClues,
      dashboardStats: computeDashboardStats(newClues, state.visits, state.mediations, state.messages),
    };
  }),
  
  addVisit: (visit) => set((state) => { 
    const newVisits = [visit, ...state.visits];
    return {
      visits: newVisits,
      dashboardStats: computeDashboardStats(state.clues, newVisits, state.mediations, state.messages),
    };
  }),
  
  updateVisit: (id, data) => set((state) => {
    const newVisits = state.visits.map((visit) => 
      visit.id === id ? { ...visit, ...data } : visit
    );
    return {
      visits: newVisits,
      dashboardStats: computeDashboardStats(state.clues, newVisits, state.mediations, state.messages),
    };
  }),

  completeVisit: (visitId, data, operator) => {
    const state = get();
    const visit = state.visits.find(v => v.id === visitId);
    if (!visit) return;

    const record = createTimelineRecord(
      'complete_visit',
      operator,
      `已完成走访，发现问题：${(data.issues || '无').substring(0, 50)}`,
      visitId,
      'visit'
    );

    const newVisits = state.visits.map(v => 
      v.id === visitId 
        ? { ...v, ...data, status: 'completed' as const, statusName: '已完成', timeline: [...v.timeline, record] }
        : v
    );

    if (visit.clueId) {
      set((s) => ({
        clues: s.clues.map(c => 
          c.id === visit.clueId 
            ? { ...c, timeline: [...c.timeline, record], updateTime: new Date().toISOString() }
            : c
        ),
      }));
    }

    set((s) => ({
      visits: newVisits,
      dashboardStats: computeDashboardStats(s.clues, newVisits, s.mediations, s.messages),
    }));

    get().markRelatedMessagesHandled(visitId, 'visit');
    get().markRelatedMessagesExpired(visitId, 'visit');
  },
  
  addMediation: (mediation) => set((state) => { 
    const newMediations = [mediation, ...state.mediations];
    return {
      mediations: newMediations,
      dashboardStats: computeDashboardStats(state.clues, state.visits, newMediations, state.messages),
    };
  }),
  
  updateMediation: (id, data) => set((state) => {
    const newMediations = state.mediations.map((mediation) => 
      mediation.id === id ? { ...mediation, ...data } : mediation
    );
    return {
      mediations: newMediations,
      dashboardStats: computeDashboardStats(state.clues, state.visits, newMediations, state.messages),
    };
  }),
  
  createVisitFromClue: (clueId, visitData, operator) => {
    const state = get();
    const clue = state.clues.find(c => c.id === clueId);
    if (!clue) return '';
    
    const visitId = generateId();
    const newVisit: Visit = {
      id: visitId,
      clueId,
      clueTitle: clue.title,
      title: `走访：${clue.title}`,
      planDate: visitData.planDate || new Date().toISOString(),
      visitor: visitData.visitor || operator,
      visitedPerson: clue.involvedPersons[0] || '相关人员',
      visitedAddress: clue.location,
      area: clue.area,
      purpose: visitData.purpose || '线索核实走访',
      content: visitData.content || '',
      photos: [],
      issues: '',
      status: 'pending',
      statusName: '待走访',
      createTime: new Date().toISOString(),
      timeline: [
        createTimelineRecord('create_visit', operator, `从线索「${clue.title}」发起走访`, clueId, 'clue'),
      ],
    };
    
    const visitTimeline = createTimelineRecord(
      'create_visit',
      operator,
      `发起入户走访，负责人：${newVisit.visitor}`,
      visitId,
      'visit'
    );
    
    const newVisits = [newVisit, ...state.visits];
    const newClues = state.clues.map(c => 
      c.id === clueId 
        ? { ...c, status: 'processing' as const, statusName: '处理中', timeline: [...c.timeline, visitTimeline] }
        : c
    );

    set((s) => ({
      visits: newVisits,
      clues: newClues,
      dashboardStats: computeDashboardStats(newClues, newVisits, s.mediations, s.messages),
    }));
    
    get().addMessage({
      type: 'task',
      typeName: messageTypeNames['task'],
      subType: 'visit_assign',
      title: '新的走访任务',
      content: `您有一条新的走访任务：${newVisit.title}，请按时完成。`,
      relatedId: visitId,
      relatedType: 'visit',
      navigatePath: `/visits`,
      sender: '系统',
      receiver: newVisit.visitor,
      priority: 'medium',
    });
    
    return visitId;
  },
  
  createMediationFromClue: (clueId, mediationData, operator) => {
    const state = get();
    const clue = state.clues.find(c => c.id === clueId);
    if (!clue) return '';
    
    const mediationId = generateId();
    const newMediation: Mediation = {
      id: mediationId,
      clueId,
      clueTitle: clue.title,
      title: `调解：${clue.title}`,
      parties: clue.involvedPersons.map((name, idx) => ({
        name,
        phone: '',
        role: idx === 0 ? 'plaintiff' : 'defendant',
      })),
      mediator: mediationData.mediator || operator,
      mediatorPhone: '',
      startTime: new Date().toISOString(),
      deadline: mediationData.deadline,
      records: [],
      result: 'pending',
      resultName: '待调解',
      status: 'assigned',
      statusName: '已派单',
      createTime: new Date().toISOString(),
      area: clue.area,
      riskLevel: clue.riskLevel,
      timeline: [
        createTimelineRecord('create_mediation', operator, `从线索「${clue.title}」转入调解`, clueId, 'clue'),
      ],
    };
    
    const mediationTimeline = createTimelineRecord(
      'create_mediation',
      operator,
      `转入调解程序，调解员：${newMediation.mediator}`,
      mediationId,
      'mediation'
    );
    
    const newMediations = [newMediation, ...state.mediations];
    const newClues = state.clues.map(c => 
      c.id === clueId 
        ? { ...c, status: 'mediating' as const, statusName: '调解中', timeline: [...c.timeline, mediationTimeline] }
        : c
    );

    set((s) => ({
      mediations: newMediations,
      clues: newClues,
      dashboardStats: computeDashboardStats(newClues, s.visits, newMediations, s.messages),
    }));
    
    get().addMessage({
      type: 'task',
      typeName: messageTypeNames['task'],
      subType: 'mediation_assign',
      title: '新的调解案件',
      content: `您有一条新的调解案件：${newMediation.title}，请及时处理。`,
      relatedId: mediationId,
      relatedType: 'mediation',
      navigatePath: `/mediation`,
      sender: '系统',
      receiver: newMediation.mediator,
      priority: 'high',
    });
    
    return mediationId;
  },
  
  addTimelineToClue: (clueId, action, operator, description, relatedId, relatedType) => {
    const record = createTimelineRecord(action, operator, description, relatedId, relatedType);
    set((state) => ({
      clues: state.clues.map(c => 
        c.id === clueId 
          ? { ...c, timeline: [...c.timeline, record], updateTime: new Date().toISOString() }
          : c
      ),
    }));
  },
  
  addTimelineToVisit: (visitId, action, operator, description, relatedId, relatedType) => {
    const record = createTimelineRecord(action, operator, description, relatedId, relatedType);
    set((state) => ({
      visits: state.visits.map(v => 
        v.id === visitId ? { ...v, timeline: [...v.timeline, record] } : v
      ),
    }));
    
    const state = get();
    const visit = state.visits.find(v => v.id === visitId);
    if (visit?.clueId) {
      set((s) => ({
        clues: s.clues.map(c => 
          c.id === visit.clueId 
            ? { ...c, timeline: [...c.timeline, record], updateTime: new Date().toISOString() }
            : c
        ),
      }));
    }
  },
  
  addTimelineToMediation: (mediationId, action, operator, description, relatedId, relatedType) => {
    const record = createTimelineRecord(action, operator, description, relatedId, relatedType);
    set((state) => ({
      mediations: state.mediations.map(m => 
        m.id === mediationId ? { ...m, timeline: [...m.timeline, record] } : m
      ),
    }));
    
    const state = get();
    const mediation = state.mediations.find(m => m.id === mediationId);
    if (mediation?.clueId) {
      set((s) => ({
        clues: s.clues.map(c => 
          c.id === mediation.clueId 
            ? { ...c, timeline: [...c.timeline, record], updateTime: new Date().toISOString() }
            : c
        ),
      }));
    }
  },
  
  addMessage: (message) => set((state) => {
    const newMessages = [{
      ...message,
      id: generateId(),
      createTime: new Date().toISOString(),
      isRead: false,
      isHandled: false,
      isExpired: false,
    }, ...state.messages];
    return {
      messages: newMessages,
      dashboardStats: computeDashboardStats(state.clues, state.visits, state.mediations, newMessages),
    };
  }),
  
  markMessageRead: (id) => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.id === id ? { ...msg, isRead: true } : msg
    ),
  })),
  
  markMessageHandled: (id) => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.id === id ? { ...msg, isHandled: true, isRead: true } : msg
    ),
  })),
  
  markAllMessagesRead: () => set((state) => ({
    messages: state.messages.map((msg) => ({ ...msg, isRead: true })),
  })),
  
  markAllMessagesHandled: () => set((state) => {
    const newMessages = state.messages.map((msg) => ({ ...msg, isHandled: true, isRead: true }));
    return {
      messages: newMessages,
      dashboardStats: computeDashboardStats(state.clues, state.visits, state.mediations, newMessages),
    };
  }),

  markRelatedMessagesHandled: (relatedId, relatedType) => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.relatedId === relatedId && msg.relatedType === relatedType && !msg.isHandled
        ? { ...msg, isHandled: true, isRead: true }
        : msg
    ),
  })),

  markRelatedMessagesExpired: (relatedId, relatedType) => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.relatedId === relatedId && msg.relatedType === relatedType && !msg.isExpired
        ? { ...msg, isExpired: true }
        : msg
    ),
  })),

  generateReminderMessages: () => {
    const state = get();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const threeDays = 3 * oneDay;

    state.visits.forEach(visit => {
      if (visit.status === 'completed' || !visit.planDate) return;
      const planTime = new Date(visit.planDate).getTime();
      const diff = planTime - now;

      if (diff > 0 && diff <= threeDays) {
        const existing = state.messages.find(m => 
          m.relatedId === visit.id && 
          m.relatedType === 'visit' && 
          m.subType === 'visit_near_deadline' &&
          !m.isExpired
        );
        if (!existing) {
          get().addMessage({
            type: 'reminder',
            typeName: messageTypeNames['reminder'],
            subType: 'visit_near_deadline',
            title: '走访任务临近截止',
            content: `走访任务「${visit.title}」将于3天内截止，请尽快完成。`,
            relatedId: visit.id,
            relatedType: 'visit',
            navigatePath: `/visits`,
            sender: '系统',
            receiver: visit.visitor,
            priority: 'medium',
          });
        }
      }

      if (diff < 0) {
        const existing = state.messages.find(m => 
          m.relatedId === visit.id && 
          m.relatedType === 'visit' && 
          m.subType === 'visit_overdue' &&
          !m.isExpired
        );
        if (!existing) {
          get().addMessage({
            type: 'warning',
            typeName: messageTypeNames['warning'],
            subType: 'visit_overdue',
            title: '走访任务已超期',
            content: `走访任务「${visit.title}」已超期，请立即处理。`,
            relatedId: visit.id,
            relatedType: 'visit',
            navigatePath: `/visits`,
            sender: '系统',
            receiver: visit.visitor,
            priority: 'high',
          });
        }
      }
    });

    state.mediations.forEach(mediation => {
      if (mediation.status === 'closed' || mediation.status === 'completed' || !mediation.deadline) return;
      const deadlineTime = new Date(mediation.deadline).getTime();
      const diff = deadlineTime - now;

      if (diff > 0 && diff <= threeDays) {
        const existing = state.messages.find(m => 
          m.relatedId === mediation.id && 
          m.relatedType === 'mediation' && 
          m.subType === 'mediation_near_deadline' &&
          !m.isExpired
        );
        if (!existing) {
          get().addMessage({
            type: 'reminder',
            typeName: messageTypeNames['reminder'],
            subType: 'mediation_near_deadline',
            title: '调解案件临近截止',
            content: `调解案件「${mediation.title}」将于3天内截止，请尽快处理。`,
            relatedId: mediation.id,
            relatedType: 'mediation',
            navigatePath: `/mediation`,
            sender: '系统',
            receiver: mediation.mediator,
            priority: 'medium',
          });
        }
      }

      if (diff < 0) {
        const existing = state.messages.find(m => 
          m.relatedId === mediation.id && 
          m.relatedType === 'mediation' && 
          m.subType === 'mediation_overdue' &&
          !m.isExpired
        );
        if (!existing) {
          get().addMessage({
            type: 'warning',
            typeName: messageTypeNames['warning'],
            subType: 'mediation_overdue',
            title: '调解案件已超期',
            content: `调解案件「${mediation.title}」已超期，请立即处理。`,
            relatedId: mediation.id,
            relatedType: 'mediation',
            navigatePath: `/mediation`,
            sender: '系统',
            receiver: mediation.mediator,
            priority: 'high',
          });
        }
      }
    });
  },

  getVisitsByClueId: (clueId) => {
    return get().visits.filter(v => v.clueId === clueId);
  },

  getMediationsByClueId: (clueId) => {
    return get().mediations.filter(m => m.clueId === clueId);
  },

  getMessagesByRelatedId: (relatedId, relatedType) => {
    if (relatedType) {
      return get().messages.filter(m => m.relatedId === relatedId && m.relatedType === relatedType);
    }
    return get().messages.filter(m => m.relatedId === relatedId);
  },

  refreshDashboardStats: () => {
    const state = get();
    set({
      dashboardStats: computeDashboardStats(state.clues, state.visits, state.mediations, state.messages),
    });
  },
}));
