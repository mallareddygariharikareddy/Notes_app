import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EmptyState } from './src/components/EmptyState';
import { NoteEditorScreen } from './src/screens/NoteEditorScreen';
import { NotesListScreen } from './src/screens/NotesListScreen';
import type { NotesViewMode } from './src/screens/NotesListScreen';
import { exportNoteAsText } from './src/services/exportService';
import { createEmptyNote, hardDeleteNote, listNotes, restoreNote, saveNote, softDeleteNote } from './src/storage/notesStorage';
import { Note, SortMode } from './src/types/note';
import { getTheme } from './src/theme/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme ?? 'light'), [colorScheme]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [viewMode, setViewMode] = useState<NotesViewMode>('active');
  const [isReady, setIsReady] = useState(false);

  const load = useCallback(async () => {
    const storedNotes = await listNotes();
    setNotes(storedNotes);
    setIsReady(true);
  }, []);

  useEffect(() => {
    load().catch(() => setIsReady(true));
  }, [load]);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId && typeof note.deletedAt !== 'number') ?? null,
    [activeNoteId, notes],
  );

  const handleCreate = useCallback(async () => {
    const note = createEmptyNote();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotes((current) => [note, ...current]);
    setViewMode('active');
    setActiveNoteId(note.id);
    await saveNote(note);
  }, []);

  const handleSave = useCallback(async (note: Note) => {
    setNotes((current) => current.map((item) => (item.id === note.id ? { ...item, ...note } : item)));
    await saveNote(note);
  }, []);

  const handleDelete = useCallback((note: Note) => {
    Alert.alert('Move note to trash?', 'This note will be hidden from Notes and can be restored from Trash.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Move to Trash',
        style: 'destructive',
        onPress: async () => {
          const deletedAt = Date.now();
          const deletedNote: Note = { ...note, deletedAt, pinned: false, updatedAt: deletedAt };
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setNotes((current) => current.map((item) => (item.id === note.id ? deletedNote : item)));
          setActiveNoteId(null);
          await softDeleteNote(note.id);
        },
      },
    ]);
  }, []);

  const handleHardDelete = useCallback((note: Note) => {
    Alert.alert('Permanently delete note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Forever',
        style: 'destructive',
        onPress: async () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setNotes((current) => current.filter((item) => item.id !== note.id));
          await hardDeleteNote(note.id);
        },
      },
    ]);
  }, []);

  const handleRestore = useCallback(async (note: Note) => {
    const { deletedAt, ...restored } = note;
    const restoredNote: Note = { ...restored, updatedAt: Date.now() };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotes((current) => current.map((item) => (item.id === note.id ? restoredNote : item)));
    await restoreNote(note.id);
  }, []);

  const handleTogglePin = useCallback(
    async (note: Note) => {
      const updated: Note = { ...note, pinned: !note.pinned, updatedAt: Date.now() };
      await handleSave(updated);
    },
    [handleSave],
  );

  const handleExport = useCallback(async (note: Note) => {
    try {
      await exportNoteAsText(note);
    } catch {
      Alert.alert('Export failed', 'The note could not be exported right now.');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={[styles.app, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        {!isReady ? (
          <EmptyState title="Loading notes" message="Getting your notes ready..." />
        ) : activeNote ? (
          <NoteEditorScreen
            note={activeNote}
            theme={theme}
            onBack={() => setActiveNoteId(null)}
            onDelete={handleDelete}
            onExport={handleExport}
            onSave={handleSave}
            onTogglePin={handleTogglePin}
          />
        ) : (
          <NotesListScreen
            notes={notes}
            query={query}
            sortMode={sortMode}
            theme={theme}
            viewMode={viewMode}
            onCreate={handleCreate}
            onHardDelete={handleHardDelete}
            onOpen={setActiveNoteId}
            onQueryChange={setQuery}
            onRestore={handleRestore}
            onSortChange={setSortMode}
            onTogglePin={handleTogglePin}
            onViewModeChange={setViewMode}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
