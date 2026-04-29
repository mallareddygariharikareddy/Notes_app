import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';

type MarkdownPreviewProps = {
  content: string;
  theme: AppTheme;
};

export function MarkdownPreview({ content, theme }: MarkdownPreviewProps) {
  const lines = content.split('\n').filter((line) => line.trim().length > 0);

  if (!lines.length) {
    return <Text style={[styles.placeholder, { color: theme.colors.muted }]}>Markdown preview</Text>;
  }

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const heading = trimmed.match(/^(#{1,3})\s+(.+)/);
        const listItem = trimmed.match(/^[-*]\s+(.+)/);

        if (heading) {
          return (
            <Text
              key={`${line}-${index}`}
              style={[
                styles.text,
                styles.heading,
                heading[1].length === 1 ? styles.h1 : styles.h2,
                { color: theme.colors.text },
              ]}
            >
              {renderBold(heading[2], theme)}
            </Text>
          );
        }

        if (listItem) {
          return (
            <View key={`${line}-${index}`} style={styles.listRow}>
              <Text style={[styles.bullet, { color: theme.colors.muted }]}>•</Text>
              <Text style={[styles.text, { color: theme.colors.text }]}>{renderBold(listItem[1], theme)}</Text>
            </View>
          );
        }

        return (
          <Text key={`${line}-${index}`} style={[styles.text, { color: theme.colors.text }]}>
            {renderBold(trimmed, theme)}
          </Text>
        );
      })}
    </View>
  );
}

function renderBold(text: string, theme: AppTheme) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    const match = part.match(/^\*\*(.*?)\*\*$/);
    return (
      <Text key={`${part}-${index}`} style={match ? [styles.bold, { color: theme.colors.text }] : undefined}>
        {match ? match[1] : part}
      </Text>
    );
  });
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: '800',
  },
  bullet: {
    fontSize: 18,
    lineHeight: 24,
    width: 20,
  },
  container: {
    gap: 6,
  },
  h1: {
    fontSize: 22,
  },
  h2: {
    fontSize: 19,
  },
  heading: {
    fontWeight: '800',
    marginTop: 4,
  },
  listRow: {
    flexDirection: 'row',
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  text: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
});
