import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { FormField } from '../types';
import { DraggableFormFieldConfigurator } from './DraggableFormFieldConfigurator';
import { FormFieldConfigurator } from './FormFieldConfigurator';

interface DraggableFormFieldListProps {
  formFields: FormField[];
  onReorder: (newFields: FormField[]) => void;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  onRemoveField: (id: string) => void;
  fieldTypes: { value: string; label: string }[];
}

export function DraggableFormFieldList({
  formFields,
  onReorder,
  onUpdateField,
  onRemoveField,
  fieldTypes,
}: DraggableFormFieldListProps) {
  console.log('🔄 DraggableFormFieldList rendering');
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = formFields.findIndex((field) => field.id === active.id);
      const newIndex = formFields.findIndex((field) => field.id === over.id);
      
      const newFields = arrayMove(formFields, oldIndex, newIndex);
      onReorder(newFields);
    }
    
    setActiveId(null);
  };

  const activeField = activeId ? formFields.find((field) => field.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={formFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {formFields.map((field) => (
            <DraggableFormFieldConfigurator
              key={field.id}
              field={field}
              onUpdate={(updates) => onUpdateField(field.id, updates)}
              onRemove={() => onRemoveField(field.id)}
              fieldTypes={fieldTypes}
              isDragging={activeId === field.id}
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeField ? (
          <div className="shadow-2xl">
            <FormFieldConfigurator
              field={activeField}
              onUpdate={() => {}}
              onRemove={() => {}}
              fieldTypes={fieldTypes}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
