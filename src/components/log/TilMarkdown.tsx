import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { Colors, Spacing } from '@/constants/theme';

export type TilMarkdownProps = {
  content: string;
};

/** TIL entries are written as markdown (joon-dashboard's web editor uses the same convention). */
export function TilMarkdown({ content }: TilMarkdownProps) {
  return <Markdown style={markdownStyles}>{content}</Markdown>;
}

const markdownStyles = StyleSheet.create({
  body: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  heading1: { color: Colors.text, fontSize: 22, fontWeight: '800', marginTop: Spacing.three, marginBottom: Spacing.two },
  heading2: { color: Colors.text, fontSize: 19, fontWeight: '800', marginTop: Spacing.three, marginBottom: Spacing.two },
  heading3: { color: Colors.text, fontSize: 17, fontWeight: '700', marginTop: Spacing.two, marginBottom: Spacing.one },
  heading4: { color: Colors.text, fontSize: 15, fontWeight: '700', marginTop: Spacing.two, marginBottom: Spacing.one },
  heading5: { color: Colors.textDim, fontSize: 14, fontWeight: '700' },
  heading6: { color: Colors.textDim, fontSize: 13, fontWeight: '700' },
  strong: { color: Colors.text, fontWeight: '800' },
  em: { color: Colors.text, fontStyle: 'italic' },
  s: { color: Colors.text },
  text: { color: Colors.text },
  textgroup: { color: Colors.text },
  paragraph: { marginTop: 0, marginBottom: Spacing.two },
  bullet_list: {},
  ordered_list: {},
  list_item: { marginBottom: Spacing.one },
  bullet_list_icon: { color: Colors.pri2, marginRight: Spacing.one },
  ordered_list_icon: { color: Colors.pri2, marginRight: Spacing.one },
  code_inline: {
    backgroundColor: Colors.surf2,
    color: Colors.pri2,
    borderWidth: 0,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 13,
  },
  code_block: {
    backgroundColor: Colors.surf2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: Spacing.three - 2,
    color: Colors.text,
    fontSize: 13,
  },
  fence: {
    backgroundColor: Colors.surf2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: Spacing.three - 2,
    color: Colors.text,
    fontSize: 13,
  },
  blockquote: {
    backgroundColor: Colors.surf2,
    borderColor: Colors.pri,
    borderLeftWidth: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    marginVertical: Spacing.two,
  },
  link: { color: Colors.pri2 },
  hr: { backgroundColor: Colors.border, height: 1, marginVertical: Spacing.three },
  table: { borderColor: Colors.border },
  th: { color: Colors.text },
  td: { color: Colors.textDim },
  tr: { borderColor: Colors.border },
});
