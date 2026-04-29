import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import { Note } from '../types/note';
import { getNoteDisplayTitle } from '../utils/notes';

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '-').slice(0, 60) || 'note';
}

export async function exportNoteAsText(note: Note): Promise<void> {
  const title = getNoteDisplayTitle(note);
  const fileName = `${sanitizeFileName(title)}.txt`;
  const file = new File(Paths.cache, fileName);
  const text = [
    title,
    '',
    note.tags.length ? `Tags: ${note.tags.map((tag) => `#${tag}`).join(' ')}` : '',
    note.tags.length ? '' : null,
    note.content,
  ]
    .filter((line) => line !== null)
    .join('\n');

  file.create({ overwrite: true });
  file.write(text);

  if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: 'Export note' });
    return;
  }

  Alert.alert('Export ready', `Saved to ${file.uri}`);
}
