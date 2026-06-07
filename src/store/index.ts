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
  MessageType
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
  addTimelineToClue: (clueId: string, action: TimelineActionType, operator: string, description: string, relatedId?: string, relatedType?: 'clue' | 'visit' | 'mediation') => void;
  addTimelineToVisit: (visitId: string, action: TimelineActionType, operator: string, description: string, relatedId?: string, relatedType?: 'clue' | 'visit' | 'mediation') => void;
  addTimelineToMediation: (mediationId: string, action: TimelineActionType, operator: string, description: string, relatedId?: string, relatedType?: 'clue' | 'visit' | 'mediation') => void;
  addMessage: (message: Omit<Message, 'id' | 'createTime' | 'isRead' | 'isHandled'>) => void;
  markMessageRead: (id: string) => void;
  markMessageHandled: (id: string) => void;
  markAllMessagesRead: () => void;
  markAllMessagesHandled: () => void;
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
  
  addClue: (clue) => set((state) => ({ 
    clues: [clue, ...state.clues],
    dashboardStats: {
      ...state.dashboardStats,
      totalClues: state.dashboardStats.totalClues + 1,
      todayNew: state.dashboardStats.todayNew + 1,
    }
  })),
  
  updateClue: (id, data) => set((state) => ({
    clues: state.clues.map((clue) => 
      clue.id === id ? { ...clue, ...data, updateTime: new Date().toISOString() } : clue
    ),
  })),
  
  deleteClue: (id) => set((state) => ({
    clues: state.clues.filter((clue) => clue.id !== id),
  })),
  
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
    
    return {
      clues: state.clues
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
        ),
    };
  }),
  
  addVisit: (visit) => set((state) => ({ 
    visits: [visit, ...state.visits],
  })),
  
  updateVisit: (id, data) => set((state) => ({
    visits: state.visits.map((visit) => 
      visit.id === id ? { ...visit, ...data } : visit
    ),
  })),
  
  addMediation: (mediation) => set((state) => ({ 
    mediations: [mediation, ...state.mediations],
    dashboardStats: {
      ...state.dashboardStats,
      totalMediation: state.dashboardStats.totalMediation + 1,
    }
  })),
  
  updateMediation: (id, data) => set((state) => ({
    mediations: state.mediations.map((mediation) => 
      mediation.id === id ? { ...mediation, ...data } : mediation
    ),
  })),
  
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
    
    set((state) => ({
      visits: [newVisit, ...state.visits],
      clues: state.clues.map(c => 
        c.id === clueId 
          ? { ...c, status: 'processing', statusName: '处理中', timeline: [...c.timeline, visitTimeline] }
          : c
      ),
    }));
    
    get().addMessage({
      type: 'task',
      typeName: messageTypeNames['task'],
      title: '新的走访任务',
      content: `您有一条新的走访任务：${newVisit.title}`,
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
    
    set((state) => ({
      mediations: [newMediation, ...state.mediations],
      clues: state.clues.map(c => 
        c.id === clueId 
          ? { ...c, status: 'mediating', statusName: '调解中', timeline: [...c.timeline, mediationTimeline] }
          : c
      ),
      dashboardStats: {
        ...state.dashboardStats,
        totalMediation: state.dashboardStats.totalMediation + 1,
      },
    }));
    
    get().addMessage({
      type: 'task',
      typeName: messageTypeNames['task'],
      title: '新的调解案件',
      content: `您有一条新的调解案件：${newMediation.title}`,
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
  
  addMessage: (message) => set((state) => ({
    messages: [{
      ...message,
      id: generateId(),
      createTime: new Date().toISOString(),
      isRead: false,
      isHandled: false,
    }, ...state.messages],
  })),
  
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
  
  markAllMessagesHandled: () => set((state) => ({
    messages: state.messages.map((msg) => ({ ...msg, isHandled: true, isRead: true })),
  })),
}));
