import faker from 'faker';
import { Note } from './notes.interfaces';

const mockNotes = (n: number): Note[] => {
  const notes: Note[] = [];
  for (let i = 0; i < n; i++) {
    const createdOn = faker.date.past();
    const updatedOn = faker.date.past();
    updatedOn.setDate(createdOn.getDate() + faker.random.number(30));
    const content = faker.lorem.paragraphs(faker.random.number(7));
    const _id = faker.random.uuid();
    const user = faker.random.uuid();
    const locked = faker.random.boolean();
    const note: Note = {
      _id,
      createdOn: createdOn.toISOString(),
      updatedOn: updatedOn.toISOString(),
      content,
      locked,
      user,
    };

    notes.push(note);
  }

  return notes;
};
export default mockNotes;
