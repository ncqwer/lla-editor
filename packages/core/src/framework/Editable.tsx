import React from 'react';
import { Editor, Transforms } from 'slate';
import { Editable as E, ReactEditor, useSlateStatic } from 'slate-react';
import { useEditorRuntime } from '.';
import { nextifyFlow } from '../rules';
import { Nextify } from '../type';

export const Editable = ({
  onKeyDown,
  className,
  readOnly = false,
}: {
  onKeyDown?: (event: React.KeyboardEvent, editor: Editor) => void;
  className?: string;
  readOnly?: boolean;
}) => {
  const {
    renderElement,
    renderLeaf,
    onKeyDownResponseZone,
    onKeyDownAlternative,
  } = useEditorRuntime();
  const editor = useSlateStatic();
  const onKeyDownRef = React.useRef(onKeyDown);
  onKeyDownRef.current = onKeyDown;
  const handleKeyDown = React.useCallback<React.KeyboardEventHandler>(
    (event) => {
      const selection = editor.selection;
      if (!selection) return;
      const keyDown = Array.from(
        Editor.levels(editor, { at: selection, reverse: true }),
      ).map((nodeEntry) =>
        onKeyDownResponseZone(() => (next) => next(), nodeEntry),
      );
      return nextifyFlow(...keyDown, (...args) => {
        return onKeyDownAlternative(...args);
      })(
        () => {
          return onKeyDownRef.current?.(event, editor);
        },
        event,
        editor,
      );
    },
    [onKeyDownResponseZone, editor],
  );

  return (
    <div className={`lla-editor ${className || ''}`}>
      <E
        autoFocus
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
      ></E>
      {!readOnly && (
        <div
          className="lla-editor__tail"
          onClick={() => {
            const path = [editor.children.length];
            Transforms.insertNodes(editor, editor.createParagraph(''), {
              at: path,
            });
            Transforms.select(editor, Editor.start(editor, path));
            ReactEditor.focus(editor);
          }}
        ></div>
      )}
    </div>
  );
};
