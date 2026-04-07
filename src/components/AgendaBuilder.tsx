import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PredefinedAgendaItem, AgendaItem, User } from '../types';
import { getPredefinedItems, saveAgenda, getAgenda } from '../store';
import { calculateStartTimes, cn } from '../lib/utils';
import html2canvas from 'html2canvas';
import { Download, Copy, Save, Trash2, ArrowLeft, GripVertical, Check, Table } from 'lucide-react';

interface AgendaBuilderProps {
  user: User;
  initialAgendaId?: string | null;
  onBack: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  'content': 'bg-blue-100 border-blue-300 text-blue-800',
  'food': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'EC Tour': 'bg-red-100 border-red-300 text-red-800',
  'room walk': 'bg-green-100 border-green-300 text-green-800',
  'coffee break': 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

export default function AgendaBuilder({ user, initialAgendaId, onBack }: AgendaBuilderProps) {
  const [predefinedItems, setPredefinedItems] = useState<PredefinedAgendaItem[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [agendaName, setAgendaName] = useState('My Google Cloud Agenda');
  const [agendaDate, setAgendaDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isTemplate, setIsTemplate] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!initialAgendaId);
  const agendaRef = useRef<HTMLDivElement>(null);

  const [agendaId] = useState(initialAgendaId || Date.now().toString());
  const [createdAt] = useState(() => {
    if (initialAgendaId) {
      const existing = getAgenda(initialAgendaId);
      return existing?.createdAt || Date.now();
    }
    return Date.now();
  });

  useEffect(() => {
    setPredefinedItems(getPredefinedItems());
    if (initialAgendaId) {
      const existing = getAgenda(initialAgendaId);
      if (existing) {
        setAgendaName(existing.name);
        if (existing.date) setAgendaDate(existing.date);
        setAgendaItems(existing.items);
        setIsTemplate(existing.isTemplate || false);
      }
      setIsLoaded(true);
    }
  }, [initialAgendaId]);

  // Auto-save
  useEffect(() => {
    if (!isLoaded) return;
    saveAgenda({
      id: agendaId,
      name: agendaName,
      date: agendaDate,
      creatorEmail: user.email,
      items: agendaItems,
      createdAt,
      isTemplate,
    });
  }, [agendaItems, agendaName, agendaDate, agendaId, user.email, createdAt, isTemplate, isLoaded]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside a list
    if (!destination) return;

    // Reordering within the builder
    if (source.droppableId === 'builder' && destination.droppableId === 'builder') {
      const newItems = Array.from(agendaItems);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);
      setAgendaItems(calculateStartTimes(newItems));
      return;
    }

    // Dragging from predefined to builder
    if (source.droppableId === 'predefined' && destination.droppableId === 'builder') {
      const sourceItem = predefinedItems[source.index];
      const newItem: AgendaItem = {
        ...sourceItem,
        uniqueId: `${sourceItem.id}-${Date.now()}`,
        startTime: '', // Clear predefined start time so it flows automatically
      };
      
      const newItems = Array.from(agendaItems);
      newItems.splice(destination.index, 0, newItem);
      setAgendaItems(calculateStartTimes(newItems));
    }
  };

  const removeItem = (index: number) => {
    const newItems = Array.from(agendaItems);
    newItems.splice(index, 1);
    setAgendaItems(calculateStartTimes(newItems));
  };

  const updateItem = (index: number, updates: Partial<AgendaItem>) => {
    const newItems = [...agendaItems];
    newItems[index] = { ...newItems[index], ...updates };
    setAgendaItems(calculateStartTimes(newItems));
  };

  const exportPNG = async () => {
    if (!agendaRef.current) return;
    try {
      const canvas = await html2canvas(agendaRef.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Replace inputs with divs containing their values for better rendering
          const inputs = clonedDoc.querySelectorAll('input');
          inputs.forEach(input => {
            if (input.type !== 'checkbox' && input.type !== 'radio') {
              const div = clonedDoc.createElement('div');
              div.textContent = input.value;
              div.className = input.className;
              // Ensure the div looks like text
              div.style.display = 'flex';
              div.style.alignItems = 'center';
              div.style.border = 'none';
              div.style.background = 'transparent';
              if (input.parentNode) {
                input.parentNode.replaceChild(div, input);
              }
            }
          });
        }
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${agendaName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG', err);
      alert('Failed to export PNG. Please try again.');
    }
  };

  const exportTable = async () => {
    let html = `
      <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Time</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Duration</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Session</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Location</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Type</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    let plainText = 'Time\tDuration\tSession\tLocation\tType\n';

    agendaItems.forEach(item => {
      const time = item.actualStartTime || item.startTime;
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${time}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.duration} min</td>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>${item.name}</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.location}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.type}</td>
        </tr>
      `;
      plainText += `${time}\t${item.duration} min\t${item.name}\t${item.location}\t${item.type}\n`;
    });
    
    html += `
        </tbody>
      </table>
    `;

    try {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      const data = [new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      })];
      await navigator.clipboard.write(data);
      alert('Table copied to clipboard! You can now paste it directly into Google Docs.');
    } catch (err) {
      console.error('Failed to copy table', err);
      alert('Failed to copy table to clipboard. Your browser might not support this feature.');
    }
  };

  const exportMarkdown = () => {
    let md = `# ${agendaName}\n\n`;
    agendaItems.forEach(item => {
      md += `**${item.actualStartTime} - ${item.name}**\n`;
      md += `*Duration: ${item.duration} min | Location: ${item.location} | Type: ${item.type}*\n\n`;
    });
    navigator.clipboard.writeText(md).catch(err => {
      console.error('Failed to copy text', err);
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <h1 className="text-xl font-medium text-gray-800">Google Cloud Space Munich</h1>
          </div>
        </div>
        <div className="flex space-x-3 items-center">
          <span className="text-xs text-gray-500 mr-2 flex items-center">
            <Check className="w-4 h-4 mr-1 text-green-500" /> Auto-saved
          </span>
          <button onClick={exportTable} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" title="Copy as a table to paste into Google Docs">
            <Table className="w-4 h-4 mr-2" /> Copy Table
          </button>
          <button onClick={exportMarkdown} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Copy className="w-4 h-4 mr-2" /> Copy MD
          </button>
          <button onClick={exportPNG} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" /> Export PNG
          </button>
        </div>
      </header>

      {/* Main Content */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Pane: Agenda Builder */}
          <div className="flex-1 flex flex-col border-r border-gray-200 bg-gray-100 overflow-y-auto p-8">
            <div className="w-full">
              <div 
                ref={agendaRef} 
                className="bg-white p-8 rounded-xl shadow-sm min-h-[600px] w-full"
              >
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <input
                    type="text"
                    value={agendaName}
                    onChange={(e) => setAgendaName(e.target.value)}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 -ml-1 w-full placeholder-gray-400 rounded transition-colors hover:bg-gray-50"
                    placeholder="Agenda Title"
                  />
                  <div className="flex items-center mt-2 space-x-4 px-1">
                    <input
                      type="date"
                      value={agendaDate}
                      onChange={(e) => setAgendaDate(e.target.value)}
                      className="text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors"
                    />
                    <p className="text-gray-500">Google Cloud Space Munich</p>
                    <div className="flex-1"></div>
                    <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" data-html2canvas-ignore="true">
                      <input
                        type="checkbox"
                        checked={isTemplate}
                        onChange={(e) => setIsTemplate(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Make Template</span>
                    </label>
                  </div>
                </div>

                <Droppable droppableId="builder">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "min-h-[400px] rounded-lg transition-colors",
                        snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                      )}
                    >
                      {agendaItems.length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
                          Drag agenda items here to build your schedule
                        </div>
                      )}
                      
                      {agendaItems.map((item, index) => {
                        // Calculate height: 30px for every 15 minutes
                        const heightPx = Math.max((item.duration / 15) * 30, 40); // Min height 40px for readability
                        const colorClass = TYPE_COLORS[item.type] || 'bg-gray-100 border-gray-300 text-gray-800';

                        return (
                          // @ts-expect-error - key is a valid React prop
                          <Draggable key={item.uniqueId} draggableId={item.uniqueId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "mb-3 rounded-lg border p-4 flex gap-4 relative group shadow-sm transition-shadow items-start",
                                  colorClass,
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500 ring-opacity-50 z-50" : ""
                                )}
                                style={{
                                  ...provided.draggableProps.style,
                                  minHeight: `${heightPx}px`,
                                }}
                              >
                                <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100" data-html2canvas-ignore="true">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                
                                <div className="w-28 shrink-0 flex flex-col gap-2">
                                  <input
                                    type="time"
                                    value={item.startTime || item.actualStartTime}
                                    onChange={(e) => updateItem(index, { startTime: e.target.value })}
                                    className="w-full bg-white/40 border border-transparent hover:border-gray-300 focus:bg-white focus:border-blue-500 rounded px-2 py-1 text-sm font-mono font-semibold transition-colors"
                                  />
                                  <div className="flex items-center text-xs opacity-80 px-2">
                                    <input
                                      type="number"
                                      value={item.duration}
                                      onChange={(e) => updateItem(index, { duration: parseInt(e.target.value) || 0 })}
                                      className="w-12 bg-white/40 border border-transparent hover:border-gray-300 focus:bg-white focus:border-blue-500 rounded px-1 py-0.5 text-xs transition-colors"
                                    />
                                    <span className="ml-1">min</span>
                                  </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-2">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, { name: e.target.value })}
                                    className="w-full bg-white/40 border border-transparent hover:border-gray-300 focus:bg-white focus:border-blue-500 rounded px-2 py-1 font-bold text-lg transition-colors"
                                    placeholder="Session Name"
                                  />
                                  <input
                                    type="text"
                                    value={item.location}
                                    onChange={(e) => updateItem(index, { location: e.target.value })}
                                    className="w-full bg-white/40 border border-transparent hover:border-gray-300 focus:bg-white focus:border-blue-500 rounded px-2 py-1 text-sm opacity-90 transition-colors"
                                    placeholder="Location"
                                  />
                                </div>
                                
                                {/* Delete button */}
                                {!snapshot.isDragging && (
                                  <button 
                                    onClick={() => removeItem(index)}
                                    className="p-2 bg-white/50 hover:bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-red-600 shrink-0"
                                    title="Remove item"
                                    data-html2canvas-ignore="true"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>

          {/* Right Pane: Predefined Items */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Agenda Items</h2>
              <p className="text-xs text-gray-500 mt-1">Drag items to the builder</p>
            </div>
            
            <Droppable droppableId="predefined" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {predefinedItems.map((item, index) => {
                    const colorClass = TYPE_COLORS[item.type] || 'bg-gray-100 border-gray-300 text-gray-800';
                    
                    return (
                      // @ts-expect-error - key is a valid React prop
                      <Draggable key={item.id} draggableId={`predef-${item.id}`} index={index}>
                        {(provided, snapshot) => (
                          <React.Fragment>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "p-3 rounded-md border shadow-sm cursor-grab active:cursor-grabbing",
                                colorClass,
                                snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500 z-50" : ""
                              )}
                            >
                              <div className="font-bold text-sm">{item.name}</div>
                              <div className="text-xs opacity-80 mt-1">
                                {item.duration} min • {item.type}
                              </div>
                              <div className="text-xs opacity-80 mt-0.5">
                                {item.location}
                              </div>
                            </div>
                            {/* Clone placeholder to keep the list intact while dragging */}
                            {snapshot.isDragging && (
                              <div className={cn("p-3 rounded-md border opacity-50", colorClass)}>
                                <div className="font-bold text-sm">{item.name}</div>
                                <div className="text-xs mt-1">{item.duration} min • {item.type}</div>
                                <div className="text-xs mt-0.5">{item.location}</div>
                              </div>
                            )}
                          </React.Fragment>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

        </div>
      </DragDropContext>
    </div>
  );
}
