import React from 'react';
import { Editor } from 'slate';
import { Editable as E, useSlateStatic } from 'slate-react';
import { useEditorRuntime } from '.';
import { nextifyFlow } from '../rules';
import { Nextify } from '../type';

export const Editable = ({
  onKeyDown,
}: {
  onKeyDown?: (event: React.KeyboardEvent, editor: Editor) => void;
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
    <E
      autoFocus
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      onKeyDown={handleKeyDown}
    ></E>
  );
};
