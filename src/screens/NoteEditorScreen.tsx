import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '../components/IconButton';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { AppTheme } from '../theme/theme';
import { Note } from '../types/note';
import { formatNoteDate } from '../utils/date';
import { parseTags, tagsToInput } from '../utils/notes';

type NoteEditorScreenProps = {
  note: Note;
  theme: AppTheme;
  onBack: () => void;
  onDelete: (note: Note) => void;
  onExport: (note: Note) => void;
  onSave: (note: Note) => Promise<void>;
  onTogglePin: (note: Note) => void;
};

export function NoteEditorScreen({
  note,
  theme,
  onBack,
  onDelete,
  onExport,
  onSave,
  onTogglePin,
}: NoteEditorScreenProps) {
  const [draft, setDraft] = useState(note);
  const [tagsInput, setTagsInput] = useState(tagsToInput(note.tags));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(note);

  useEffect(() => {
    setDraft(note);
    setTagsInput(tagsToInput(note.tags));
    lastSaved.current = note;
  }, [note.id]);

  const normalizedDraft = useMemo<Note>(
    () => ({
      ...draft,
      tags: parseTags(tagsInput),
    }),
    [draft, tagsInput],
  );

  useEffect(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      const changed =
        normalizedDraft.title !== lastSaved.current.title ||
        normalizedDraft.content !== lastSaved.current.content ||
        normalizedDraft.pinned !== lastSaved.current.pinned ||
        normalizedDraft.tags.join('|') !== lastSaved.current.tags.join('|');

      if (!changed) {
        return;
      }

      const updated = { ...normalizedDraft, updatedAt: Date.now() };
      lastSaved.current = updated;
      setDraft(updated);
      onSave(updated);
    }, 450);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [normalizedDraft, onSave]);

  const saveNow = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    const updated = { ...normalizedDraft, updatedAt: Date.now() };
    lastSaved.current = updated;
    setDraft(updated);
    await onSave(updated);
  };

  const handleBack = async () => {
    await saveNow();
    onBack();
  };

  const handleExport = async () => {
    await saveNow();
    onExport({ ...normalizedDraft, updatedAt: Date.now() });
  };

  const handleTogglePin = () => {
    const updated = { ...normalizedDraft, pinned: !normalizedDraft.pinned, updatedAt: Date.now() };
    lastSaved.current = updated;
    setDraft(updated);
    onTogglePin(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={[styles.toolbar, { borderBottomColor: theme.colors.border }]}>
          <IconButton icon="‹" label="Back to notes" theme={theme} onPress={handleBack} />
          <View style={styles.actions}>
            <IconButton icon={draft.pinned ? '★' : '☆'} label={draft.pinned ? 'Unpin note' : 'Pin note'} theme={theme} onPress={handleTogglePin} />
            <IconButton icon="⇧" label="Export note" theme={theme} onPress={handleExport} />
            <IconButton destructive icon="×" label="Delete note" theme={theme} onPress={() => onDelete(draft)} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            accessibilityLabel="Note title"
            maxLength={140}
            onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
            placeholder="Title"
            placeholderTextColor={theme.colors.muted}
            style={[styles.titleInput, { color: theme.colors.text }]}
            value={draft.title}
          />

          <Text style={[styles.meta, { color: theme.colors.muted }]}>
            Edited {formatNoteDate(draft.updatedAt)} · Created {formatNoteDate(draft.createdAt)}
          </Text>

          <TextInput
            accessibilityLabel="Note tags"
            autoCapitalize="none"
            onChangeText={setTagsInput}
            placeholder="Tags, separated by commas"
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.tagsInput,
              {
                backgroundColor: theme.colors.input,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={tagsInput}
          />

          <TextInput
            accessibilityLabel="Note content"
            multiline
            onChangeText={(content) => setDraft((current) => ({ ...current, content }))}
            placeholder="Start writing..."
            placeholderTextColor={theme.colors.muted}
            scrollEnabled={false}
            style={[styles.bodyInput, { color: theme.colors.text }]}
            textAlignVertical="top"
            value={draft.content}
          />

          <View style={[styles.previewBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.previewTitle, { color: theme.colors.muted }]}>Preview</Text>
            <MarkdownPreview content={draft.content} theme={theme} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  bodyInput: {
    fontSize: 17,
    lineHeight: 26,
    minHeight: 280,
    paddingTop: 24,
  },
  content: {
    paddingBottom: 48,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  keyboard: {
    flex: 1,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  previewBox: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 24,
    padding: 16,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  safeArea: {
    flex: 1,
  },
  tagsInput: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
    marginTop: 18,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    minHeight: 54,
    padding: 0,
  },
  toolbar: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
