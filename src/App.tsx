/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import AuthWrapper from './components/AuthWrapper';
import AgendaList from './components/AgendaList';
import AgendaBuilder from './components/AgendaBuilder';
import AdminUI from './components/AdminUI';

type ViewState = 'list' | 'builder' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewState>('list');
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);

  return (
    <AuthWrapper>
      {(user, logout) => {
        if (view === 'admin') {
          return <AdminUI onBack={() => setView('list')} />;
        }
        
        if (view === 'builder') {
          return <AgendaBuilder 
            user={user} 
            initialAgendaId={selectedAgendaId}
            onBack={() => setView('list')} 
          />;
        }

        return (
          <AgendaList 
            user={user} 
            onCreateNew={() => { setSelectedAgendaId(null); setView('builder'); }} 
            onEdit={(id) => { setSelectedAgendaId(id); setView('builder'); }}
            onOpenAdmin={() => setView('admin')}
            onLogout={logout}
          />
        );
      }}
    </AuthWrapper>
  );
}
