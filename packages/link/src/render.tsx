import {
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  LLAOverLayer,
  PlaceholderContext,
  shotkey,
} from '@lla-editor/core';
import { ElementJSX } from '@lla-editor/core';
import React from 'react';
import { Range, Transforms } from 'slate';
import { ReactEditor, useSelected, useSlateStatic } from 'slate-react';
import { LinkElement } from './element';

const linkInputAlignOpt = {
  points: ['tc', 'bc'],
};

const LinkHover: React.FC<{ value: string }> = ({ value }) => {
  return (
    <span className="lla-link-hover ">
      <svg viewBox="0 0 14 14">
        <path d="M7.003 13C10.286 13 13 10.286 13 7.003 13 3.714 10.286 1 6.997 1 3.714 1 1 3.714 1 7.003 1 10.286 3.72 13 7.003 13zM5.29 4.04c.344-.883.824-1.523 1.346-1.73v1.866c-.48-.012-.93-.059-1.346-.136zm2.074-1.73c.522.207 1.002.847 1.346 1.73a8.537 8.537 0 01-1.346.136V2.31zm1.34.225a4.77 4.77 0 011.57.99c-.243.13-.527.242-.835.337a5.229 5.229 0 00-.735-1.327zm-4.984.99c.45-.427.984-.765 1.576-.99a5.229 5.229 0 00-.735 1.327 4.98 4.98 0 01-.841-.338zm6.252 3.11a9.112 9.112 0 00-.314-2.097c.42-.13.794-.29 1.108-.474.563.717.918 1.6.995 2.572h-1.79zm-7.728 0a4.74 4.74 0 01.984-2.571c.314.183.693.343 1.114.474a9.112 9.112 0 00-.314 2.098H2.244zm2.525 0a8.8 8.8 0 01.296-1.914c.486.101 1.02.16 1.57.184v1.73H4.77zm2.595 0v-1.73a10.002 10.002 0 001.57-.184 8.8 8.8 0 01.297 1.915H7.364zM2.24 7.36h1.79c.023.77.135 1.487.307 2.127a4.99 4.99 0 00-1.09.468A4.794 4.794 0 012.239 7.36zm2.53 0h1.867v1.76a9.272 9.272 0 00-1.57.183 8.342 8.342 0 01-.297-1.943zm2.595 1.76v-1.76h1.867a9.02 9.02 0 01-.296 1.943 9.344 9.344 0 00-1.57-.183zm2.294.367a9.01 9.01 0 00.314-2.127h1.79a4.742 4.742 0 01-1.002 2.595 5.098 5.098 0 00-1.102-.468zm-2.294.361c.48.012.93.06 1.346.137-.344.877-.824 1.523-1.346 1.73V9.847zm-2.074.137a8.537 8.537 0 011.346-.137v1.867c-.522-.207-1.002-.853-1.346-1.73zm4.149.172c.302.094.58.207.83.337a4.736 4.736 0 01-1.542.966c.273-.355.516-.794.712-1.303zm-5.701.337a4.78 4.78 0 01.823-.337c.196.503.433.942.706 1.297a4.767 4.767 0 01-1.53-.96z"></path>
      </svg>
      {value}
    </span>
  );
};

const LinkInputPannel: React.FC<{
  value: string;
  onChange: (v: string) => void;
  unLink: () => void;
}> = ({ value, onChange, unLink }) => {
  const [url, setUrl] = React.useState('');
  return (
    <div className="lla-link-input-pannel" contentEditable={false}>
      <input
        type="text"
        placeholder="更改链接"
        className="lla-link-input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (shotkey('enter')(null, e)) {
            onChange(url);
          }
        }}
      />
      <div className="lla-link-goto">
        <div className="lla-link-goto__label">跳转到</div>
        <div className="lla-link-goto__content">
          <svg viewBox="0 0 14 14">
            <path d="M7.003 13C10.286 13 13 10.286 13 7.003 13 3.714 10.286 1 6.997 1 3.714 1 1 3.714 1 7.003 1 10.286 3.72 13 7.003 13zM5.29 4.04c.344-.883.824-1.523 1.346-1.73v1.866c-.48-.012-.93-.059-1.346-.136zm2.074-1.73c.522.207 1.002.847 1.346 1.73a8.537 8.537 0 01-1.346.136V2.31zm1.34.225a4.77 4.77 0 011.57.99c-.243.13-.527.242-.835.337a5.229 5.229 0 00-.735-1.327zm-4.984.99c.45-.427.984-.765 1.576-.99a5.229 5.229 0 00-.735 1.327 4.98 4.98 0 01-.841-.338zm6.252 3.11a9.112 9.112 0 00-.314-2.097c.42-.13.794-.29 1.108-.474.563.717.918 1.6.995 2.572h-1.79zm-7.728 0a4.74 4.74 0 01.984-2.571c.314.183.693.343 1.114.474a9.112 9.112 0 00-.314 2.098H2.244zm2.525 0a8.8 8.8 0 01.296-1.914c.486.101 1.02.16 1.57.184v1.73H4.77zm2.595 0v-1.73a10.002 10.002 0 001.57-.184 8.8 8.8 0 01.297 1.915H7.364zM2.24 7.36h1.79c.023.77.135 1.487.307 2.127a4.99 4.99 0 00-1.09.468A4.794 4.794 0 012.239 7.36zm2.53 0h1.867v1.76a9.272 9.272 0 00-1.57.183 8.342 8.342 0 01-.297-1.943zm2.595 1.76v-1.76h1.867a9.02 9.02 0 01-.296 1.943 9.344 9.344 0 00-1.57-.183zm2.294.367a9.01 9.01 0 00.314-2.127h1.79a4.742 4.742 0 01-1.002 2.595 5.098 5.098 0 00-1.102-.468zm-2.294.361c.48.012.93.06 1.346.137-.344.877-.824 1.523-1.346 1.73V9.847zm-2.074.137a8.537 8.537 0 011.346-.137v1.867c-.522-.207-1.002-.853-1.346-1.73zm4.149.172c.302.094.58.207.83.337a4.736 4.736 0 01-1.542.966c.273-.355.516-.794.712-1.303zm-5.701.337a4.78 4.78 0 01.823-.337c.196.503.433.942.706 1.297a4.767 4.767 0 01-1.53-.96z"></path>
          </svg>
          {value}
        </div>
      </div>
      <div className="lla-link-input-pannel__divider"></div>
      <div className="lla-link-remove" onClick={unLink}>
        <svg viewBox="0 0 30 30">
          <path d="M21,5c0-2.2-1.8-4-4-4h-4c-2.2,0-4,1.8-4,4H2v2h2v22h22V7h2V5H21z M13,3h4c1.104,0,2,0.897,2,2h-8C11,3.897,11.897,3,13,3zM24,27H6V7h18V27z M16,11h-2v12h2V11z M20,11h-2v12h2V11z M12,11h-2v12h2V11z"></path>
        </svg>
        删除链接
      </div>
    </div>
  );
};
const Link: React.FC<ExtendRenderElementProps<LinkElement>> = ({
  attributes,
  children,
  element,
}) => {
  // const [value, setValue] = React.useState('http://www.baidu.com');
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const editor = useSlateStatic();
  const selected = useSelected();
  const { url } = element;
  React.useEffect(() => {
    if (selected && editor.selection && Range.isCollapsed(editor.selection)) {
      setIsOpen(true);
    }
  }, [selected, editor]);
  return (
    <a href={url} className="lla-link" {...attributes}>
      <span ref={ref}>{children}</span>
      <LinkHover value={url}></LinkHover>
      {isOpen && (
        <LLAOverLayer
          alignOpts={linkInputAlignOpt}
          onClose={() => setIsOpen(false)}
          targetGet={() => ref.current}
        >
          <LinkInputPannel
            value={url}
            onChange={(v) => {
              const path = ReactEditor.findPath(editor, element);
              Transforms.setNodes(editor, { url: v }, { at: path });
              setIsOpen(false);
            }}
            unLink={() => {
              const path = ReactEditor.findPath(editor, element);
              Transforms.unwrapNodes(editor, { at: path });
            }}
          ></LinkInputPannel>
        </LLAOverLayer>
      )}
    </a>
  );
};

export default [
  [elementPropsIs(LinkElement.is), elementRender(Link)],
] as ElementJSX<LinkElement>;
