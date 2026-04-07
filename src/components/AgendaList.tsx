import React, { useState, useEffect } from 'react';
import { Agenda, User } from '../types';
import { getAgendas, saveAgenda, deleteAgenda } from '../store';
import { Plus, Settings, Calendar, Clock, MapPin, Trash2, Copy } from 'lucide-react';

interface AgendaListProps {
  user: User;
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export default function AgendaList({ user, onCreateNew, onEdit, onOpenAdmin, onLogout }: AgendaListProps) {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [agendaToDelete, setAgendaToDelete] = useState<Agenda | null>(null);

  const loadAgendas = () => {
    setAgendas(getAgendas().sort((a, b) => b.createdAt - a.createdAt));
  };

  useEffect(() => {
    loadAgendas();
  }, []);

  const handleDuplicate = (e: React.MouseEvent, agenda: Agenda) => {
    e.stopPropagation();
    const newAgenda = {
      ...agenda,
      id: Date.now().toString(),
      name: `${agenda.name} (Copy)`,
      createdAt: Date.now(),
    };
    saveAgenda(newAgenda);
    loadAgendas();
  };

  const confirmDelete = () => {
    if (agendaToDelete) {
      deleteAgenda(agendaToDelete.id);
      loadAgendas();
      setAgendaToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Google Cloud Space Munich</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button onClick={onOpenAdmin} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Admin Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={onLogout} className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">All Agendas</h2>
          <button
            onClick={onCreateNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Agenda
          </button>
        </div>

        {agendas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agendas yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first agenda for Google Cloud Space Munich.</p>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Agenda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agendas.map(agenda => {
              const totalDuration = agenda.items.reduce((acc, item) => acc + item.duration, 0);
              const startTime = agenda.items[0]?.actualStartTime || '--:--';
              
              return (
                <div 
                  key={agenda.id} 
                  onClick={() => onEdit(agenda.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group"
                >
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDuplicate(e, agenda)} 
                      className="p-1.5 bg-white shadow-sm border border-gray-200 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      title="Duplicate Agenda"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAgendaToDelete(agenda); }} 
                      className="p-1.5 bg-white shadow-sm border border-gray-200 rounded-md text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors"
                      title="Delete Agenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate flex items-center gap-2">
                      {agenda.name}
                      {agenda.isTemplate && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">Template</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Created by {agenda.creatorEmail}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {agenda.date ? new Date(agenda.date).toLocaleDateString() : 'No date set'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        Starts at {startTime} ({totalDuration} mins)
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {agenda.items.length} sessions
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview</h4>
                      <div className="space-y-1">
                        {agenda.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="text-sm text-gray-700 truncate">
                            <span className="font-mono text-xs text-gray-500 mr-2">{item.actualStartTime}</span>
                            {item.name}
                          </div>
                        ))}
                        {agenda.items.length > 3 && (
                          <div className="text-xs text-gray-400 italic mt-1">
                            + {agenda.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {agendaToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Agenda?</h3>
            {agendaToDelete.isTemplate ? (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-semibold text-sm mb-1">⚠️ Warning: Template File</p>
                <p className="text-red-600 text-sm">This is marked as a template, not a normal customer agenda. Are you sure you want to delete it?</p>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">Are you sure you want to delete this agenda? This action cannot be undone.</p>
            )}
            <div className="flex justify-end space-x-3">
              <button onClick={() => setAgendaToDelete(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
