export interface NoteI {
  id: string;
  title: string;
  info: string;
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
