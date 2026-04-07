import React, { useState } from 'react';
import { PredefinedAgendaItem, AgendaItemType } from '../types';
import { savePredefinedItem, getPredefinedItems, deletePredefinedItem } from '../store';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

interface AdminUIProps {
  onBack: () => void;
}

export default function AdminUI({ onBack }: AdminUIProps) {
  const [items, setItems] = useState<PredefinedAgendaItem[]>(getPredefinedItems());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [type, setType] = useState<AgendaItemType>('content');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PredefinedAgendaItem = {
      id: editingId || Date.now().toString(),
      name,
      duration: parseInt(duration, 10),
      type,
      location,
    };
    savePredefinedItem(newItem);
    setItems(getPredefinedItems());
    
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDuration('30');
    setType('content');
    setLocation('');
  };

  const handleEdit = (item: PredefinedAgendaItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDuration(item.duration.toString());
    setType(item.type);
    setLocation(item.location);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deletePredefinedItem(id);
      setItems(getPredefinedItems());
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Admin: Configure Agenda Items</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input type="number" required min="5" step="5" value={duration} onChange={e => setDuration(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={type} onChange={e => setType(e.target.value as AgendaItemType)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="content">Content</option>
                <option value="room walk">Room Walk</option>
                <option value="food">Food / Coffee Break</option>
                <option value="EC Tour">EC Tour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="flex-1 bg-white text-gray-700 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Existing Items</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {items.map(item => (
              <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.duration} min • {item.type} • {item.location}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
