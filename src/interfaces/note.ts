export interface NoteI {
  id: string;
  title: string;
  info: string;
  type?: 'normal' | 'list';
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
