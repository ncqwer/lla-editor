import React from 'react';
import { ElementJSX, ExtendRenderElementProps } from '@lla-editor/core';
import { CustomVoidElement } from './element';
import { ReactEditor, useSelected, useSlateStatic } from 'slate-react';
import { Transforms } from 'slate';
import type { RenderElementProps } from 'slate-react';

const CustomVoidComponent: React.FC<
  ExtendRenderElementProps<CustomVoidElement> & { Comp: any }
> = ({ attributes, element, children, Comp }) => {
  const editor = useSlateStatic();
  const { value, mode } = element;
  const selected = useSelected();
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      className={`lla-custom-void lla-custom-void--${mode}${
        selected ? ' lla-selected' : ''
      }`}
      {...attributes}
    >
      <div
        contentEditable={false}
        className="lla-custom-void-content lla-context-menu-target"
      >
        <div
          ref={ref}
          className="lla-context-menu-trigger "
          onClick={(e) => {
            e.stopPropagation();
            openContextMenu(() => ref.current);
          }}
        >
          ...
        </div>
        <Comp
          value={value}
          onChange={React.useCallback(
            (v: any) => {
              const path = ReactEditor.findPath(editor, element);
              Transforms.setNodes(editor, { value: v }, { at: path });
            },
            [editor, element],
          )}
        ></Comp>
      </div>
      {children}
    </div>
  );

  function openContextMenu(targetGet: () => HTMLElement | null) {
    const contextMenu = editor.getOvlerLayer('contextMenu');
    if (contextMenu) {
      contextMenu.open({
        path: ReactEditor.findPath(editor, element),
        element,
        targetGet,
      });
    }
  }
};

export default (...customVoids: { mode: string; Comp: any }[]) =>
  customVoids.map(({ mode, Comp }) => {
    return [
      is,
      (props) =>
        (
          <CustomVoidComponent {...props} Comp={Comp}></CustomVoidComponent>
        ) as any,
    ];
    function is({
      element,
      ...others
    }: RenderElementProps):
      | [ExtendRenderElementProps<CustomVoidElement>]
      | undefined {
      if (CustomVoidElement.is(element) && element.mode === mode)
        return [{ ...others, element }];
      return undefined;
    }
  }) as ElementJSX<CustomVoidElement>;
