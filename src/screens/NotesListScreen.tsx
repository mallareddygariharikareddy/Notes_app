import { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { NoteCard } from '../components/NoteCard';
import { AppTheme } from '../theme/theme';
import { Note, SortMode } from '../types/note';
import { filterAndSortNotes } from '../utils/notes';

export type NotesViewMode = 'active' | 'trash';

type NotesListScreenProps = {
  notes: Note[];
  query: string;
  sortMode: SortMode;
  theme: AppTheme;
  viewMode: NotesViewMode;
  onCreate: () => void;
  onHardDelete: (note: Note) => void;
  onOpen: (noteId: string) => void;
  onQueryChange: (query: string) => void;
  onRestore: (note: Note) => void;
  onSortChange: (mode: SortMode) => void;
  onTogglePin: (note: Note) => void;
  onViewModeChange: (mode: NotesViewMode) => void;
};

export function NotesListScreen({
  notes,
  query,
  sortMode,
  theme,
  viewMode,
  onCreate,
  onHardDelete,
  onOpen,
  onQueryChange,
  onRestore,
  onSortChange,
  onTogglePin,
  onViewModeChange,
}: NotesListScreenProps) {
  const activeNotes = useMemo(() => notes.filter((note) => typeof note.deletedAt !== 'number'), [notes]);
  const deletedNotes = useMemo(() => notes.filter((note) => typeof note.deletedAt === 'number'), [notes]);
  const sourceNotes = viewMode === 'trash' ? deletedNotes : activeNotes;
  const visibleNotes = useMemo(() => filterAndSortNotes(sourceNotes, query, sortMode), [sourceNotes, query, sortMode]);
  const isTrash = viewMode === 'trash';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{isTrash ? 'Trash' : 'Notes'}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            {sourceNotes.length} {sourceNotes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <TextInput
          accessibilityLabel="Search notes"
          autoCapitalize="none"
          onChangeText={onQueryChange}
          placeholder="Search notes"
          placeholderTextColor={theme.colors.muted}
          style={[
            styles.search,
            {
              backgroundColor: theme.colors.input,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          value={query}
        />

        <View style={[styles.segment, { backgroundColor: theme.colors.elevated }]}>
          <SortButton active={sortMode === 'updated'} label="Last edited" theme={theme} onPress={() => onSortChange('updated')} />
          <SortButton active={sortMode === 'created'} label="Created" theme={theme} onPress={() => onSortChange('created')} />
        </View>

        <View style={[styles.segment, { backgroundColor: theme.colors.elevated }]}>
          <SortButton active={!isTrash} label="Notes" theme={theme} onPress={() => onViewModeChange('active')} />
          <SortButton active={isTrash} label={`Trash (${deletedNotes.length})`} theme={theme} onPress={() => onViewModeChange('trash')} />
        </View>

        <FlatList
          contentContainerStyle={visibleNotes.length ? styles.list : styles.emptyList}
          data={visibleNotes}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              title={query.trim() ? 'No matches' : isTrash ? 'Trash is empty' : 'No notes yet'}
              message={
                query.trim()
                  ? 'Try a different title, word, or tag.'
                  : isTrash
                    ? 'Soft-deleted notes will appear here.'
                    : 'Tap the add button to write your first note.'
              }
            />
          }
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              theme={theme}
              onHardDelete={onHardDelete}
              onOpen={onOpen}
              onRestore={onRestore}
              onTogglePin={onTogglePin}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {!isTrash && (
        <Pressable
          accessibilityLabel="Create note"
          accessibilityRole="button"
          onPress={onCreate}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: pressed ? theme.colors.elevated : theme.colors.accent,
              shadowColor: theme.mode === 'dark' ? '#000000' : '#8A6A00',
            },
          ]}
        >
          <Text style={[styles.fabIcon, { color: theme.colors.accentText }]}>+</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function SortButton({
  active,
  label,
  theme,
  onPress,
}: {
  active: boolean;
  label: string;
  theme: AppTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.segmentButton, active && { backgroundColor: theme.colors.surface }]}
    >
      <Text style={[styles.segmentText, { color: active ? theme.colors.text : theme.colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  fab: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 28,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    width: 56,
  },
  fabIcon: {
    fontSize: 32,
    lineHeight: 36,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  list: {
    paddingBottom: 110,
    paddingTop: 16,
  },
  safeArea: {
    flex: 1,
  },
  search: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  segment: {
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 12,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
  },
});
