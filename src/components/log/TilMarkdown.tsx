import { memo } from 'react';
import Markdown from 'react-native-markdown-display';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Palette } from '@/constants/theme';

export type TilMarkdownProps = {
  content: string;
};

/** TIL entries are written as markdown (joon-dashboard's web editor uses the same convention). */
export const TilMarkdown = memo(function TilMarkdown({ content }: TilMarkdownProps) {
  const colors = useTheme();
  return <Markdown style={buildMarkdownStyles(colors)}>{content}</Markdown>;
});

// react-native-markdown-display takes a plain style object, not a
// StyleSheet.create() result - built per-render from the live theme instead
// of once at module load, unlike every other component here.
function buildMarkdownStyles(colors: Palette) {
  return {
    body: { color: colors.text, fontSize: 15, lineHeight: 22 },
    heading1: { color: colors.text, fontSize: 22, fontWeight: '800' as const, marginTop: Spacing.three, marginBottom: Spacing.two },
    heading2: { color: colors.text, fontSize: 19, fontWeight: '800' as const, marginTop: Spacing.three, marginBottom: Spacing.two },
    heading3: { color: colors.text, fontSize: 17, fontWeight: '700' as const, marginTop: Spacing.two, marginBottom: Spacing.one },
    heading4: { color: colors.text, fontSize: 15, fontWeight: '700' as const, marginTop: Spacing.two, marginBottom: Spacing.one },
    heading5: { color: colors.textDim, fontSize: 14, fontWeight: '700' as const },
    heading6: { color: colors.textDim, fontSize: 13, fontWeight: '700' as const },
    strong: { color: colors.text, fontWeight: '800' as const },
    em: { color: colors.text, fontStyle: 'italic' as const },
    s: { color: colors.text },
    text: { color: colors.text },
    textgroup: { color: colors.text },
    paragraph: { marginTop: 0, marginBottom: Spacing.two },
    bullet_list: {},
    ordered_list: {},
    list_item: { marginBottom: Spacing.one },
    bullet_list_icon: { color: colors.pri2, marginRight: Spacing.one },
    ordered_list_icon: { color: colors.pri2, marginRight: Spacing.one },
    code_inline: {
      backgroundColor: colors.surf2,
      color: colors.pri2,
      borderWidth: 0,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      fontSize: 13,
    },
    code_block: {
      backgroundColor: colors.surf2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: Spacing.three - 2,
      color: colors.text,
      fontSize: 13,
    },
    fence: {
      backgroundColor: colors.surf2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: Spacing.three - 2,
      color: colors.text,
      fontSize: 13,
    },
    blockquote: {
      backgroundColor: colors.surf2,
      borderColor: colors.pri,
      borderLeftWidth: 3,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.one,
      marginVertical: Spacing.two,
    },
    link: { color: colors.pri2 },
    hr: { backgroundColor: colors.border, height: 1, marginVertical: Spacing.three },
    table: { borderColor: colors.border },
    th: { color: colors.text },
    td: { color: colors.textDim },
    tr: { borderColor: colors.border },
  };
}
