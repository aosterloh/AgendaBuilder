export type AgendaItemType = 'content' | 'food' | 'EC Tour' | 'room walk' | 'coffee break' | string;

export interface PredefinedAgendaItem {
  id: string;
  name: string;
  startTime?: string; // e.g., "09:30"
  duration: number; // in minutes
  type: AgendaItemType;
  location: string;
}

export interface AgendaItem extends PredefinedAgendaItem {
  uniqueId: string; // For drag and drop instances
  actualStartTime?: string; // Calculated start time
}

export interface Agenda {
  id: string;
  name: string;
  date?: string;
  creatorEmail: string;
  items: AgendaItem[];
  createdAt: number;
  isTemplate?: boolean;
}

export interface User {
  email: string;
  name: string;
}
