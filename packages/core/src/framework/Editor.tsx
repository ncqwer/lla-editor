import React from 'react';
import { createPortal } from 'react-dom';
import { createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { withReact, Slate } from 'slate-react';
import { useEditorRuntime } from '.';
import { InsertOverLayer } from './overlayer/insert';
import { ContextMenu } from './overlayer/contextMenu';
import { TextActionMenu } from './overlayer/textMenu';
import { ConfigHelers } from './index';

const { useLens } = ConfigHelers;

export const Editor: React.FC<{
  value: Descendant[];
  onChange: (v: Descendant[]) => void;
}> = ({ value, onChange, children }) => {
  const [html2md] = useLens(['core', 'html2md']);
  const [txt2md] = useLens(['core', 'txt2md']);
  const [md2txt] = useLens(['core', 'md2txt']);
  const {
    withEditor,
    onParagraphConvert,
    deserialize,
    serialize,
    createMediaBlock,
  } = useEditorRuntime();
  const editor = React.useMemo(() => {
    const baseEditor = createEditor();
    baseEditor.convertFromParagraph = onParagraphConvert;
    baseEditor.deserialize = (ele, editor, acc) =>
      deserialize(() => acc, ele, editor, acc);
    baseEditor.serialize = (str, editor) => serialize(() => '', str, editor);
    baseEditor.createMediaBlock = (file, edtior) =>
      createMediaBlock(() => null, file, editor);
    const editor = withEditor(withReact(withHistory(baseEditor)));
    return editor;
  }, [withEditor, deserialize, serialize, createMediaBlock]);
  editor.html2md = html2md;
  editor.txt2md = txt2md;
  editor.md2txt = md2txt;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const [overLayerId] = useLens(['core', 'overlayerId']);
  const root = React.useMemo(
    () => mounted && document.getElementById(overLayerId),
    [mounted],
  );
  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      {children}
      {mounted &&
        createPortal(
          <>
            <InsertOverLayer></InsertOverLayer>
            <ContextMenu></ContextMenu>
            <TextActionMenu></TextActionMenu>
          </>,
          root as any,
        )}
    </Slate>
  );
};
