import React from 'react';
import {
  ConfigHelers,
  ElementJSX,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  LLAConfig,
  LLAOverLayer,
  PlaceholderContext,
  SharedApi,
} from '@lla-editor/core';
import { CalloutElement } from './element';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSlateStatic } from 'slate-react';

const { useGetting } = ConfigHelers as SharedApi<LLAConfig>;

const alignOpts = { points: ['tl', 'bl'] };

const DefaultPicker = () => (
  <div className="p-4 rounded shadow-sm bg-white border text-xs text-gray-400">
    正在加载emoji组件...
  </div>
);

const Callout: React.FC<ExtendRenderElementProps<CalloutElement>> = ({
  element,
  children,
  attributes,
}) => {
  const { emoji, txtColor, bgColor } = element;
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const PickerRaw = useGetting(['callout', 'PickerComponent']);
  const Picker = PickerRaw || DefaultPicker;
  return (
    <>
      <div
        className={`lla-callout ${bgColor || ''} ${txtColor || ''}`}
        {...attributes}
      >
        <div className="lla-callout__mark" contentEditable={false}>
          <div className="lla-callout__emoji-wrapper">
            <span
              role="img"
              aria-label={emoji}
              ref={ref}
              onClick={() => !readOnly && setIsOpen(true)}
            >
              {emoji}
            </span>
          </div>
        </div>
        <PlaceholderContext.Provider value={'记录一些重要的事！'}>
          <div className="lla-callout-content">{children}</div>
        </PlaceholderContext.Provider>
      </div>
      {isOpen && (
        <LLAOverLayer
          onClose={() => setIsOpen(false)}
          targetGet={() => ref.current}
          alignOpts={alignOpts}
        >
          <Picker
            onSelect={(v: any) => {
              const nV = v.native;
              if (emoji !== nV) {
                Transforms.setNodes(
                  editor,
                  { emoji: nV },
                  { at: ReactEditor.findPath(editor, element) },
                );
              }
              setIsOpen(false);
            }}
          ></Picker>
        </LLAOverLayer>
      )}
    </>
  );
};

export default [
  [elementPropsIs(CalloutElement.is), elementRender(Callout)],
] as ElementJSX<CalloutElement>;
