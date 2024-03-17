import { NoteI } from './note';

export type EditorModeT = 'create' | 'update';

export type EditorInfoT = {
  show: boolean;
  mode: EditorModeT;
  item?: undefined | NoteI;
};
