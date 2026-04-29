import { Note, SortMode } from '../types/note';

export function getNoteDisplayTitle(note: Note): string {
  const firstLine = note.content.split('\n').find((line) => line.trim().length > 0);
  return note.title.trim() || firstLine?.trim() || 'Untitled';
}

export function getNotePreview(note: Note): string {
  const preview = note.content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .trim();

  return preview || 'No additional text';
}

export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean),
    ),
  );
}

export function tagsToInput(tags: string[]): string {
  return tags.join(', ');
}

export function filterAndSortNotes(notes: Note[], query: string, sortMode: SortMode): Note[] {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? notes.filter((note) => {
        const haystack = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : notes;

  return [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    const aTime = sortMode === 'created' ? a.createdAt : a.updatedAt;
    const bTime = sortMode === 'created' ? b.createdAt : b.updatedAt;
    return bTime - aTime;
  });
}
