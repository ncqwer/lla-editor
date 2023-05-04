import React, { useState, useMemo } from 'react';
import { Descendant } from 'slate';
import {
  PluginProvider,
  Environment,
  Editor,
  Editable,
  ConfigHelers,
  ParagraphImpl,
  LLAConfig,
} from '@lla-editor/core';
import ListImpl from '@lla-editor/list';
import ImageImpl from '@lla-editor/image';
import HeadingImpl from '@lla-editor/heading';
import DividerImpl from '@lla-editor/divider';
import CalloutImpl from '@lla-editor/callout';
import AudioImpl from '@lla-editor/audio';
import VideoImpl from '@lla-editor/video';
import QuoteImpl from '@lla-editor/quote';
import LinkImpl from '@lla-editor/link';
import CodeImpl from '@lla-editor/code';
import IndentImpl from '@lla-editor/indent';
import TextBlockImpl from '@lla-editor/text-block';

export const availablePlugins = [
  TextBlockImpl,
  IndentImpl,
  ListImpl,
  HeadingImpl,
  CodeImpl,
  ImageImpl,
  VideoImpl,
  AudioImpl,
  DividerImpl,
  QuoteImpl,
  CalloutImpl,
  LinkImpl,
  ParagraphImpl,
];

export const { SharedProvider } = ConfigHelers;

export const LLAEnvironment: React.FC<{
  plugins?: { pluginName: string }[];
}> = ({ children, plugins = availablePlugins }) => {
  return (
    <PluginProvider availablePlugins={plugins}>
      <Environment
        activePluginNames={React.useMemo(
          () => plugins.map(({ pluginName }) => pluginName),
          [plugins],
        )}
      >
        {children}
      </Environment>
    </PluginProvider>
  );
};

export const LLAEditor: React.FC<{
  value: Descendant[];
  onChange: (v: Descendant[]) => void;
  readOnly?: boolean;
  className?: string;
}> = ({ value, onChange, className, readOnly, children }) => {
  return (
    <Editor value={value} onChange={onChange}>
      <Editable className={className} readOnly={readOnly}></Editable>
      {children}
    </Editor>
  );
};

export { Editor as RawEditor, Editable as RawEditable };
export const createInitialValue: (intialValue?: string) => Descendant[] = (
  initialValue = '',
) => [
  {
    type: 'text-block',
    children: [{ type: 'paragraph', children: [{ text: initialValue }] }],
  },
];
