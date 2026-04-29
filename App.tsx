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
import { exportNoteAsText } from './src/services/exportService';
import { createEmptyNote, deleteNote, listNotes, saveNote } from './src/storage/notesStorage';
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
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [activeNoteId, notes],
  );

  const handleCreate = useCallback(async () => {
    const note = createEmptyNote();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotes((current) => [note, ...current]);
    setActiveNoteId(note.id);
    await saveNote(note);
  }, []);

  const handleSave = useCallback(async (note: Note) => {
    setNotes((current) => current.map((item) => (item.id === note.id ? note : item)));
    await saveNote(note);
  }, []);

  const handleDelete = useCallback((note: Note) => {
    Alert.alert('Delete note?', 'This note will be permanently removed from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setNotes((current) => current.filter((item) => item.id !== note.id));
          setActiveNoteId(null);
          await deleteNote(note.id);
        },
      },
    ]);
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
            onCreate={handleCreate}
            onOpen={setActiveNoteId}
            onQueryChange={setQuery}
            onSortChange={setSortMode}
            onTogglePin={handleTogglePin}
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
