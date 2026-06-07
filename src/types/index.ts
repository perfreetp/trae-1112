export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ClueStatus = 'pending' | 'processing' | 'mediating' | 'resolved' | 'closed';
export type ClueType = 'neighbor' | 'property' | 'family' | 'labor' | 'other';
export type VisitStatus = 'pending' | 'completed' | 'overdue';
export type MediationStatus = 'assigned' | 'mediating' | 'completed' | 'closed';
export type MediationResult = 'pending' | 'success' | 'failed' | 'escalated';
export type MessageType = 'system' | 'task' | 'warning' | 'reminder';
export type Priority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'grid' | 'mediator';
export type TimelineActionType = 
  | 'register' 
  | 'merge' 
  | 'create_visit' 
  | 'complete_visit' 
  | 'create_mediation' 
  | 'assign_mediator' 
  | 'mediation_record'
  | 'escalate' 
  | 'follow_up'
  | 'resolve'
  | 'close';

export interface TimelineRecord {
  id: string;
  time: string;
  action: TimelineActionType;
  actionName: string;
  operator: string;
  description: string;
  relatedId?: string;
  relatedType?: 'clue' | 'visit' | 'mediation';
}

export interface MergedInfo {
  sourceId: string;
  sourceTitle: string;
  sourceLocation: string;
  mergeTime: string;
}

export interface Clue {
  id: string;
  title: string;
  type: ClueType;
  typeName: string;
  description: string;
  location: string;
  area: string;
  latitude?: number;
  longitude?: number;
  involvedPersons: string[];
  reporter: string;
  reporterPhone?: string;
  riskLevel: RiskLevel;
  status: ClueStatus;
  statusName: string;
  createTime: string;
  updateTime: string;
  assignee?: string;
  deadline?: string;
  attachments: string[];
  mergedFrom?: string[];
  mergedInfos?: MergedInfo[];
  isDuplicate: boolean;
  timeline: TimelineRecord[];
}

export interface Visit {
  id: string;
  clueId?: string;
  clueTitle?: string;
  title: string;
  planDate: string;
  actualDate?: string;
  visitor: string;
  visitedPerson: string;
  visitedAddress: string;
  area: string;
  purpose: string;
  content: string;
  photos: string[];
  issues: string;
  status: VisitStatus;
  statusName: string;
  createTime: string;
  timeline: TimelineRecord[];
}

export interface Party {
  name: string;
  phone: string;
  role: 'plaintiff' | 'defendant' | 'witness';
}

export interface MediationRecord {
  id: string;
  time: string;
  content: string;
  participants: string[];
  attachments: string[];
}

export interface FollowUp {
  time: string;
  visitor: string;
  content: string;
  satisfaction: 1 | 2 | 3 | 4 | 5;
  comment: string;
}

export interface Mediation {
  id: string;
  clueId: string;
  clueTitle?: string;
  title: string;
  parties: Party[];
  mediator: string;
  mediatorPhone?: string;
  startTime: string;
  endTime?: string;
  deadline?: string;
  records: MediationRecord[];
  result: MediationResult;
  resultName: string;
  agreement?: string;
  followUp?: FollowUp;
  status: MediationStatus;
  statusName: string;
  createTime: string;
  area: string;
  riskLevel: RiskLevel;
  timeline: TimelineRecord[];
  isEscalatedFromFailed?: boolean;
}

export interface PersonRecord {
  id: string;
  time: string;
  type: 'visit' | 'mediation' | 'warning';
  content: string;
  operator: string;
}

export interface KeyPerson {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  idCard?: string;
  phone?: string;
  address: string;
  area: string;
  tags: string[];
  riskLevel: Exclude<RiskLevel, 'critical'>;
  caseCount: number;
  lastContactTime?: string;
  remark?: string;
  isBlacklisted: boolean;
  createTime: string;
  records: PersonRecord[];
}

export interface Message {
  id: string;
  type: MessageType;
  typeName: string;
  title: string;
  content: string;
  relatedId?: string;
  relatedType?: 'clue' | 'visit' | 'mediation';
  navigatePath?: string;
  sender: string;
  receiver: string;
  isRead: boolean;
  isHandled: boolean;
  createTime: string;
  priority: Priority;
}

export interface DailyStats {
  date: string;
  clueCount: number;
  mediationCount: number;
  resolvedCount: number;
  visitCount: number;
}

export interface TypeStats {
  type: string;
  typeName: string;
  count: number;
  percentage: number;
}

export interface AreaStats {
  area: string;
  count: number;
  resolvedCount: number;
  rate: number;
}

export interface DashboardStats {
  totalClues: number;
  pendingClues: number;
  todayNew: number;
  successRate: number;
  keyPersons: number;
  highRisk: number;
  overdue: number;
  totalMediation: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleName: string;
  avatar?: string;
  phone: string;
  area?: string;
}
