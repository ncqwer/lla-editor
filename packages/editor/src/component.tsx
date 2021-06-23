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
import IndentImpl from '@lla-editor/indent';
import TextBlockImpl from '@lla-editor/text-block';
import ListImpl from '@lla-editor/list';
import ImageImpl from '@lla-editor/image';
import HeadingImpl from '@lla-editor/heading';
import DividerImpl from '@lla-editor/divider';
import CalloutImpl from '@lla-editor/callout';
import AudioImpl from '@lla-editor/audio';
import VideoImpl from '@lla-editor/video';
import QuoteImpl from '@lla-editor/quote';

const availablePlugins = [
  TextBlockImpl,
  IndentImpl,
  ListImpl,
  HeadingImpl,
  ImageImpl,
  VideoImpl,
  AudioImpl,
  DividerImpl,
  QuoteImpl,
  CalloutImpl,
  ParagraphImpl,
];
const activeNames = availablePlugins.map(({ pluginName }) => pluginName);

const { SharedProvider } = ConfigHelers;

export const LLAEnvironment: React.FC = ({ children }) => {
  return (
    <PluginProvider availablePlugins={availablePlugins}>
      <Environment activePluginNames={activeNames}>{children}</Environment>
    </PluginProvider>
  );
};

export const Example = () => {
  const imageRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLInputElement>(null);
  const promiseRef = React.useRef<any>(null);
  const [value, setValue] = useState<Descendant[]>(createInitialValue());
  return (
    <LLAEnvironment>
      <SharedProvider
        initialValue={React.useMemo<Partial<LLAConfig>>(
          () => ({
            indentContainer: {
              indent: 24,
            },
            image: {
              loadingCover: 'loadingCover',
              errorCover: 'errorCover',
              imgOpen: async () => {
                if (promiseRef.current) promiseRef.current[1]();
                imageRef.current?.click();
                return new Promise<string>((res, rej) => {
                  promiseRef.current = [res, rej];
                });
              },
              imgSign: async (id: any) => id,
              imgRemove: async (id) => console.log(id),
            },
            audio: {
              loadingCover: 'loadingCover',
              errorCover: 'errorCover',
              audioOpen: async () => {
                if (promiseRef.current) promiseRef.current[1]();
                audioRef.current?.click();
                return new Promise<string>((res, rej) => {
                  promiseRef.current = [res, rej];
                });
              },
              audioSign: async (id: any) => id,
              audioRemove: async (id: any) => console.log(id),
            },
            video: {
              loadingCover: 'loadingCover',
              errorCover: 'errorCover',
              videoOpen: async () => {
                if (promiseRef.current) promiseRef.current[1]();
                videoRef.current?.click();
                return new Promise<string>((res, rej) => {
                  promiseRef.current = [res, rej];
                });
              },
              videoSign: async (id: any) => id,
              videoRemove: async (id: any) => console.log(id),
            },
          }),
          [],
        )}
      >
        <LLAEditor value={value} onChange={setValue}></LLAEditor>
        <input
          type="file"
          className="hidden"
          ref={imageRef}
          onChange={async (e) => {
            const file = e.target?.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            const dataURL: string | null = await new Promise((res) => {
              reader.onload = (event) => {
                if (event.target) return res(event.target.result as string);
                return res(null);
              };
              reader.readAsDataURL(file);
            });
            dataURL && promiseRef.current && promiseRef.current[0](dataURL);
          }}
          accept=".jpeg,.jpg,.png"
        />
        <input
          type="file"
          className="hidden"
          ref={audioRef}
          onChange={async (e) => {
            const file = e.target?.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            const dataURL: string | null = await new Promise((res) => {
              reader.onload = (event) => {
                if (event.target) return res(event.target.result as string);
                return res(null);
              };
              reader.readAsDataURL(file);
            });
            dataURL && promiseRef.current && promiseRef.current[0](dataURL);
          }}
          accept=".mp3"
        />
        <input
          type="file"
          className="hidden"
          ref={videoRef}
          onChange={async (e) => {
            const file = e.target?.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            const dataURL: string | null = await new Promise((res) => {
              reader.onload = (event) => {
                if (event.target) return res(event.target.result as string);
                return res(null);
              };
              reader.readAsDataURL(file);
            });
            dataURL && promiseRef.current && promiseRef.current[0](dataURL);
          }}
          accept=".mp4"
        />
      </SharedProvider>
    </LLAEnvironment>
  );
};

export const LLAEditor: React.FC<{
  value: Descendant[];
  onChange: (v: Descendant[]) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  return (
    <Editor value={value} onChange={onChange}>
      <Editable className={className}></Editable>
    </Editor>
  );
};
export const createInitialValue: () => Descendant[] = () => [
  {
    type: 'text-block',
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  },
];
