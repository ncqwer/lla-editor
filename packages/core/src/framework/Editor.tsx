import React from 'react';
import { createPortal } from 'react-dom';
import { createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { withReact, Slate } from 'slate-react';
import { useEditorRuntime } from '.';
import { InsertOverLayer } from './overlayer/insert';
import { ContextMenu } from './overlayer/contextMenu';

export const Editor: React.FC<{
  value: Descendant[];
  onChange: (v: Descendant[]) => void;
}> = ({ value, onChange, children }) => {
  const { withEditor, onParagraphConvert } = useEditorRuntime();
  const editor = React.useMemo(() => {
    const baseEditor = createEditor();
    baseEditor.convertFromParagraph = onParagraphConvert;
    const editor = withReact(withHistory(withEditor(baseEditor)));
    return editor;
  }, [withEditor]);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const root = React.useMemo(
    () => mounted && document.getElementById('root'),
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
          </>,
          root as any,
        )}
    </Slate>
  );
};
