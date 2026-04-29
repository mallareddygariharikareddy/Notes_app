import AsyncStorage from '@react-native-async-storage/async-storage';

import { Note } from '../types/note';

const NOTES_KEY = '@notes/items/v1';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyNote(): Note {
  const now = Date.now();

  return {
    id: createId(),
    title: '',
    content: '',
    tags: [],
    createdAt: now,
    updatedAt: now,
    pinned: false,
  };
}

export async function listNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed) ? parsed.filter(isValidNote) : [];
  } catch {
    return [];
  }
}

export async function saveNote(note: Note): Promise<void> {
  const notes = await listNotes();
  const index = notes.findIndex((item) => item.id === note.id);
  const nextNotes = index >= 0 ? notes.map((item) => (item.id === note.id ? note : item)) : [note, ...notes];
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(nextNotes));
}

export async function deleteNote(noteId: string): Promise<void> {
  const notes = await listNotes();
  await AsyncStorage.setItem(
    NOTES_KEY,
    JSON.stringify(notes.filter((note) => note.id !== noteId)),
  );
}

function isValidNote(value: unknown): value is Note {
  const note = value as Partial<Note>;
  return (
    typeof note?.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    Array.isArray(note.tags) &&
    typeof note.createdAt === 'number' &&
    typeof note.updatedAt === 'number' &&
    typeof note.pinned === 'boolean'
  );
}
