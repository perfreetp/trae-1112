import { create } from 'zustand';
import type { Clue, Visit, Mediation, KeyPerson, Message, DashboardStats, User } from '@/types';
import { mockClues } from '@/data/clues';
import { mockVisits } from '@/data/visits';
import { mockMediations } from '@/data/mediation';
import { mockKeyPersons } from '@/data/keyPersons';
import { mockMessages } from '@/data/messages';
import { mockDashboardStats } from '@/data/statistics';

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
  mergeClues: (targetId: string, sourceIds: string[]) => void;
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, data: Partial<Visit>) => void;
  addMediation: (mediation: Mediation) => void;
  updateMediation: (id: string, data: Partial<Mediation>) => void;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
}

export const useAppStore = create<AppState>((set) => ({
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
  
  mergeClues: (targetId, sourceIds) => set((state) => {
    const targetClue = state.clues.find(c => c.id === targetId);
    if (!targetClue) return state;
    
    const sourceClues = state.clues.filter(c => sourceIds.includes(c.id));
    const mergedDescriptions = [targetClue.description, ...sourceClues.map(c => c.description)].filter(Boolean).join('\n\n---\n\n');
    const mergedInvolved = [...new Set([...targetClue.involvedPersons, ...sourceClues.flatMap(c => c.involvedPersons)])];
    const mergedAttachments = [...targetClue.attachments, ...sourceClues.flatMap(c => c.attachments)];
    
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
                isDuplicate: false,
                updateTime: new Date().toISOString(),
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
  
  markMessageRead: (id) => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.id === id ? { ...msg, isRead: true } : msg
    ),
  })),
  
  markAllMessagesRead: () => set((state) => ({
    messages: state.messages.map((msg) => ({ ...msg, isRead: true })),
  })),
}));
