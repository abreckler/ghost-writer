import errors from '../../lib/errors';
import mockNotes from './mockNotes';
import { Note } from "./notes.interfaces"

export const getNoteById = async (id: string): Promise<Note> => {
  if (id === 'xxxx') {
    throw new errors.NotFoundError(`Document with an ID: ${id} is not found`);
  } else {
    return mockNotes(2)[0];
  }
}