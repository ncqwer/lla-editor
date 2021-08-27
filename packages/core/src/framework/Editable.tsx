import React from 'react';
import { Editor, Transforms, Range, NodeEntry, Path } from 'slate';
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
    decorate,
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
  const handleDecorate = React.useCallback(
    (entry: NodeEntry): Range[] => decorate(() => [], entry),
    [decorate],
  );

  return (
    <div className={`lla-editor ${className || ''}`}>
      <E
        autoFocus
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={handleKeyDown}
        decorate={handleDecorate}
        readOnly={readOnly}
      ></E>
      {!readOnly && (
        <div
          className="lla-editor__tail"
          onClick={() => {
            const path = [editor.children.length];
            const lastElement = editor.children[
              editor.children.length - 1
            ] as any;
            if (lastElement.type === 'text-block') {
              Transforms.select(
                editor,
                Editor.end(editor, Path.previous(path)),
              );
              ReactEditor.focus(editor);
              return;
            }
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
