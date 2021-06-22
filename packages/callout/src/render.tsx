import React from 'react';
import { Picker } from 'emoji-mart';
import {
  ElementJSX,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  LLAOverLayer,
  PlaceholderContext,
} from '@lla-editor/core';
import { CalloutElement } from './element';
import { Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';

const emojiI18 = {
  search: '查询',
  clear: '清除',
  notfound: '暂无emoji',
  categories: {
    search: '查询结果',
    recent: '最近使用',
  },
};

const alignOpts = { points: ['tl', 'bl'] };

const Callout: React.FC<ExtendRenderElementProps<CalloutElement>> = ({
  element,
  children,
  attributes,
}) => {
  const { emoji } = element;
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const editor = useSlateStatic();
  return (
    <>
      <div className="lla-callout" {...attributes}>
        <div className="lla-callout__mark" contentEditable={false}>
          <div className="lla-callout__emoji-wrapper">
            <span
              role="img"
              aria-label={emoji}
              ref={ref}
              onClick={() => setIsOpen(true)}
            >
              {emoji}
            </span>
          </div>
        </div>
        <PlaceholderContext.Provider value={'记录一些重要的事！'}>
          {children}
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
            showSkinTones={false}
            showPreview={false}
            emojiTooltip={true}
            i18n={emojiI18}
          ></Picker>
        </LLAOverLayer>
      )}
    </>
  );
};

export default [
  [elementPropsIs(CalloutElement.is), elementRender(Callout)],
] as ElementJSX<CalloutElement>;
