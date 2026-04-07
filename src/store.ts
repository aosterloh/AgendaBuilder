import { Agenda, PredefinedAgendaItem } from './types';

const INITIAL_ITEMS: PredefinedAgendaItem[] = [
  { id: '1', name: 'Breakfast', duration: 60, type: 'food', location: 'South Cafe' },
  { id: '2', name: 'VOC', duration: 30, type: 'content', location: 'Cinema' },
  { id: '3', name: 'Inspiration', duration: 60, type: 'content', location: 'Cinema' },
  { id: '4', name: 'Coffee', duration: 15, type: 'food', location: 'MK' },
  { id: '5', name: 'EC Tour', duration: 60, type: 'EC Tour', location: 'EC' },
  { id: '6', name: 'Cloud Content', duration: 60, type: 'content', location: 'EBC room' },
  { id: '7', name: 'Office Transition', duration: 15, type: 'room walk', location: '' },
  { id: '8', name: 'Lunch', duration: 60, type: 'food', location: 'South Cafe' },
];

export const getPredefinedItems = (): PredefinedAgendaItem[] => {
  const stored = localStorage.getItem('predefinedItems');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Merge any INITIAL_ITEMS that are missing by ID
    const missing = INITIAL_ITEMS.filter(init => !parsed.some((p: any) => p.id === init.id));
    if (missing.length > 0) {
      const updated = [...parsed, ...missing];
      localStorage.setItem('predefinedItems', JSON.stringify(updated));
      return updated;
    }
    return parsed;
  }
  localStorage.setItem('predefinedItems', JSON.stringify(INITIAL_ITEMS));
  return INITIAL_ITEMS;
};

export const savePredefinedItem = (item: PredefinedAgendaItem) => {
  const items = getPredefinedItems();
  const existingIndex = items.findIndex(i => i.id === item.id);
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }
  localStorage.setItem('predefinedItems', JSON.stringify(items));
};

export const deletePredefinedItem = (id: string) => {
  const items = getPredefinedItems().filter(i => i.id !== id);
  localStorage.setItem('predefinedItems', JSON.stringify(items));
};

export const getAgendas = (): Agenda[] => {
  const stored = localStorage.getItem('agendas');
  return stored ? JSON.parse(stored) : [];
};

export const getAgenda = (id: string): Agenda | undefined => {
  return getAgendas().find(a => a.id === id);
};

export const deleteAgenda = (id: string) => {
  const agendas = getAgendas().filter(a => a.id !== id);
  localStorage.setItem('agendas', JSON.stringify(agendas));
};

export const saveAgenda = (agenda: Agenda) => {
  const agendas = getAgendas();
  const existingIndex = agendas.findIndex(a => a.id === agenda.id);
  if (existingIndex >= 0) {
    agendas[existingIndex] = agenda;
  } else {
    agendas.push(agenda);
  }
  localStorage.setItem('agendas', JSON.stringify(agendas));
};
