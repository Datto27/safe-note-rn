export interface TaskI {
  id: string;
  title: string;
  note?: string; // encrypted at rest (like NoteI.info)
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO string, optional
  deleted?: boolean; // soft delete
  createdAt: Date;
  updatedAt: Date;
}
