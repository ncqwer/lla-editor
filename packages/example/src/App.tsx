import React, { useState, useMemo } from 'react';
import { Descendant } from 'slate';
import {
  PluginProvider,
  Environment,
  Editor,
  Editable,
  ConfigHelers,
  ParagraphImpl,
  useDebounce,
  useThrottle,
  Func,
  LLAConfig,
  LLAOverLayer,
  shotkey,
} from '@lla-editor/core';
import { createPortal } from 'react-dom';
import IndentImpl from '@lla-editor/indent';
import TextBlockImpl from '@lla-editor/text-block';
import ListImpl from '@lla-editor/list';
import domAlign from 'dom-align';
import ImageImpl from '@lla-editor/image';
import HeadingImpl from '@lla-editor/heading';
import DividerImpl from '@lla-editor/divider';
import CalloutImpl from '@lla-editor/callout';
import AudioImpl from '@lla-editor/audio';
import VideoImpl from '@lla-editor/video';
import QuoteImpl from '@lla-editor/quote';
import LinkImpl from '@lla-editor/link';
import Slider from 'rc-slider';
import copy from 'copy-to-clipboard';
import { Example, LLAEditor } from '@lla-editor/editor';
import createCustomVoid from '@lla-editor/custom-void';
// import TurndownService from 'turndown';
import unified from 'unified';
import parse from 'rehype-parse';
import rehype2remark from 'rehype-remark';
import remarkParse from 'remark-parse';
import stringify from 'remark-stringify';
import { animated, useSpring } from 'react-spring';

const processor = unified().use(parse).use(rehype2remark);
const txtprocessor = unified().use(remarkParse);
const mdprocessor = unified().use(stringify, {
  bullet: '*',
  fence: '~',
  fences: true,
  incrementListMarker: false,
});

const availablePlugins = [
  TextBlockImpl,
  IndentImpl,
  ListImpl,
  HeadingImpl,
  ImageImpl,
  VideoImpl,
  AudioImpl,
  LinkImpl,
  // createCustomVoid({
  //   mode: 'input',
  //   initialValue: 'initialValue',
  //   keywords: ['input'],
  //   title: '输入框',
  //   description: '示例输入框',
  //   Comp: ({
  //     value,
  //     onChange,
  //   }: {
  //     value: string;
  //     onChange: (v: string) => void;
  //   }) => (
  //     <input
  //       type="text"
  //       value={value}
  //       onChange={(e) => onChange(e.target.value)}
  //     />
  //   ),
  // }),
  DividerImpl,
  QuoteImpl,
  CalloutImpl,
  ParagraphImpl,
];
const activeNames = availablePlugins.map(({ pluginName }) => pluginName);

const { SharedProvider } = ConfigHelers;

const PlainTextExample = () => {
  // return (
  //   <div className="max-w-3xl mr-auto ml-auto mt-32 lla-readonly">
  //     <Example></Example>
  //   </div>
  // );
  const imageRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLInputElement>(null);
  const promiseRef = React.useRef<any>(null);
  return (
    <PluginProvider availablePlugins={availablePlugins}>
      <Environment activePluginNames={activeNames}>
        <SharedProvider
          initialValue={React.useMemo<Partial<LLAConfig>>(
            () => ({
              core: {
                html2md: (v: string) => {
                  const node = processor.parse(v);
                  const ast = processor.runSync(node);
                  return ast;
                },
                txt2md: (v: string) => {
                  return txtprocessor.parse(v);
                },
                md2txt: (ast: any) => {
                  return mdprocessor.stringify(ast);
                },
                overlayerId: 'root',
              },
              indentContainer: {
                indent: 24,
              },
              image: {
                loadingCover:
                  'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/loading.png',
                errorCover:
                  'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/NotFound.png',
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
                loadingCover:
                  'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/loading.png',
                errorCover:
                  'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/NotFound.png',
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
                loadingCover:
                  'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/loading.png',
                errorCover:
                  'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/NotFound.png',
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
          <AEditor></AEditor>
          <input
            type="file"
            className="hidden"
            ref={imageRef}
            onChange={async (e) => {
              const file = e.target?.files?.[0];
              if (!file) return;
              promiseRef.current && promiseRef.current[0](file);
              // const reader = new FileReader();
              // const dataURL: string | null = await new Promise((res) => {
              //   reader.onload = (event) => {
              //     if (event.target) return res(event.target.result as string);
              //     return res(null);
              //   };
              //   reader.readAsDataURL(file);
              // });
              // dataURL && promiseRef.current && promiseRef.current[0](dataURL);
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
              promiseRef.current && promiseRef.current[0](file);
              // const reader = new FileReader();
              // const dataURL: string | null = await new Promise((res) => {
              //   reader.onload = (event) => {
              //     if (event.target) return res(event.target.result as string);
              //     return res(null);
              //   };
              //   reader.readAsDataURL(file);
              // });
              // dataURL && promiseRef.current && promiseRef.current[0](dataURL);
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
              promiseRef.current && promiseRef.current[0](file);
              // const reader = new FileReader();
              // const dataURL: string | null = await new Promise((res) => {
              //   reader.onload = (event) => {
              //     if (event.target) return res(event.target.result as string);
              //     return res(null);
              //   };
              //   reader.readAsDataURL(file);
              // });
              // dataURL && promiseRef.current && promiseRef.current[0](dataURL);
            }}
            accept=".mp4"
          />
        </SharedProvider>
      </Environment>
    </PluginProvider>
  );
};

const SubPage = () => {
  return (
    <div className="bg-red-100 h-40 w-40 shadow-md border rounded cursor-pointer hover:shadow-xl">
      <div></div>
    </div>
  );
};

const AEditor = () => {
  const [value, setValue] = useState<Descendant[]>(initialValue());
  const [v, setV] = useState(1080);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  return (
    <div className="max-w-3xl mr-auto ml-auto mt-32 lla-readonly">
      <LLAEditor
        value={value}
        onChange={setValue}
        readOnly={readOnly}
      ></LLAEditor>
      <div className="lla-divider"></div>
      <button
        className="p-4 rounded border active:bg-gray-200 hover:bg-gray-100"
        onClick={() => {
          console.log(value);
          copy(JSON.stringify(value));
        }}
      >
        GET
      </button>
      <button
        className="p-4 rounded border active:bg-gray-200 hover:bg-gray-100"
        onClick={() => setReadOnly((prev) => !prev)}
      >
        {readOnly ? 'read only' : 'edit'}
      </button>
      <SubPage></SubPage>
    </div>
  );
};
const initialValue: () => Descendant[] = () => [
  {
    children: [
      {
        type: 'text-block',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ],
    type: 'audio',
    width: 700,
  },
  {
    children: [
      {
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
        type: 'text-block',
      },
    ],
    type: 'video',
    width: 700,
  },
  {
    children: [{ type: 'paragraph', children: [{ text: 'asdfasdfsadf' }] }],
    type: 'text-block',
  },
  {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    type: 'text-block',
  },
];

export default PlainTextExample;
