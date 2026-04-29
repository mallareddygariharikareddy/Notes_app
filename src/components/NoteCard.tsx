import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';
import { Note } from '../types/note';
import { formatNoteDate } from '../utils/date';
import { getNoteDisplayTitle, getNotePreview } from '../utils/notes';

type NoteCardProps = {
  note: Note;
  theme: AppTheme;
  onOpen: (noteId: string) => void;
  onTogglePin: (note: Note) => void;
};

export function NoteCard({ note, theme, onOpen, onTogglePin }: NoteCardProps) {
  return (
    <Pressable
      onPress={() => onOpen(note.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.colors.elevated : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
          {getNoteDisplayTitle(note)}
        </Text>
        <Pressable
          accessibilityLabel={note.pinned ? 'Unpin note' : 'Pin note'}
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => onTogglePin(note)}
        >
          <Text style={[styles.pin, { color: note.pinned ? theme.colors.accent : theme.colors.muted }]}>★</Text>
        </Pressable>
      </View>
      <Text numberOfLines={3} style={[styles.preview, { color: theme.colors.muted }]}>
        {getNotePreview(note)}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.date, { color: theme.colors.muted }]}>{formatNoteDate(note.updatedAt)}</Text>
        <View style={styles.tags}>
          {note.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.chip }]}>
              <Text style={[styles.tagText, { color: theme.colors.muted }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    padding: 16,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  pin: {
    fontSize: 20,
  },
  preview: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    maxWidth: '58%',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
});
