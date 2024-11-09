import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KanbanColumn } from '@/types';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  setColumns: (columns: KanbanColumn[]) => void;
}

export const KanbanBoard = ({ columns, setColumns }: KanbanBoardProps) => {
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const addItem = (columnId: string) => {
    if (!newItemText.trim()) return;

    const newColumns = columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          items: [...col.items, { id: Date.now().toString(), content: newItemText }]
        };
      }
      return col;
    });

    setColumns(newColumns);
    setNewItemText('');
    setAddingToColumn(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newColumns = [...columns];
    
    const sourceCol = newColumns.find(col => col.id === source.droppableId);
    const destCol = newColumns.find(col => col.id === destination.droppableId);
    
    if (sourceCol && destCol) {
      const [movedItem] = sourceCol.items.splice(source.index, 1);
      destCol.items.splice(destination.index, 0, movedItem);
      setColumns(newColumns);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="w-72 flex-shrink-0">
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold mb-4">{column.title}</h3>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[100px]"
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 bg-white rounded shadow"
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {addingToColumn === column.id ? (
                <div className="mt-4 space-y-2">
                  <Input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem(column.id)}
                    placeholder="Enter item text..."
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => addItem(column.id)}>Add</Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setAddingToColumn(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setAddingToColumn(column.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};