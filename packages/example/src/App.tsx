import React, { useState, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
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
import CodeImpl from '@lla-editor/code';
import TableImpl from '@lla-editor/table';
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
import gfm from 'remark-gfm';
import { animated, useSpring } from 'react-spring';
import Handsontable from 'handsontable';
import { HotTable, HotTableProps } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import dayjs from 'dayjs';
import { ApolloProvider } from '@apollo/client';

import {
  UserAvatar,
  ActionGroup,
  ExtraActionGroup,
  Comment,
  Reply,
  ReplyList,
  CommentList,
  Paginator,
  UserInfoProvider,
  LoginModal,
  User,
} from './components';
import { stat } from 'fs';

const processor = unified().use(parse).use(rehype2remark);
const txtprocessor = unified().use(gfm).use(remarkParse);
const mdprocessor = unified().use(gfm).use(stringify, {
  bullet: '*',
  fence: '`',
  fences: true,
  incrementListMarker: false,
});

const availablePlugins = [
  TextBlockImpl,
  IndentImpl,
  CodeImpl,
  TableImpl,
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
              table: {
                HTableComponent: React.forwardRef((props: any, ref: any) => (
                  <HotTable
                    {...props}
                    ref={ref}
                    licenseKey="non-commercial-and-evaluation"
                  ></HotTable>
                )),
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

const CodeLineElement = () => {
  return (
    <div className={`lla-code-line`}>
      <span>
        {
          'const compose = (...funcs) => funcs.reduce((acc,func)=>(...args)=>acc(func(...args)))'
        }
      </span>
    </div>
  );
};

const Try = () => {
  const [value, setValue] = React.useState(2);
  if (value !== 7) setValue(7);
  return (
    <div
      className="p-2 rounded cursor-pointer bg-gray-100"
      onClick={async () => {
        const authorize_uri = 'https://github.com/login/oauth/authorize';
        const redirect_uri = 'http://localhost:7001/auth/github';
        const client_id = 'e9e29e4b1703ab85f4da';

        // const url = `${authorize_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}`;
        const url = 'http://localhost:54337';
        const popup = window.open(url);
        if (!popup) return;
        let res: any;
        let intervalId: any;
        const promise = new Promise((_r) => (res = _r));
        const handler = (event: MessageEvent) => {
          if (event.origin === url && !!event.data) res(event.data);
        };
        window.addEventListener('message', handler);
        intervalId = setInterval(() => {
          popup.postMessage(
            'lla comment system query for user login token',
            url,
          );
        }, 1000);
        const data = await promise;
        console.log(
          '%c [ data ]',
          'font-size:13px; background:pink; color:#bf2c9f;',
          data,
        );
        window.removeEventListener('message', handler);
        clearInterval(intervalId);
      }}
    >
      {value}
    </div>
  );
};

const useLocalStorage = function <T>(
  key: string,
  _value: T | (() => T),
  delay: number = 1000,
) {
  const [value, setValue] = React.useState<T>(() => {
    let v = null;
    if (window?.localStorage) v = window.localStorage.getItem(key);
    if (!v) return typeof _value === 'function' ? (_value as any)() : _value;
    return JSON.parse(v);
  });
  const preValueRef = React.useRef<T | null>(null);
  const [syncToLocalStorage] = useDebounce((newV: T) => {
    if (window?.localStorage)
      window.localStorage.setItem(key, JSON.stringify(newV));
    preValueRef.current = newV;
  }, delay);
  React.useEffect(() => {
    preValueRef.current = null;
  }, [key]);
  React.useEffect(() => {
    if (preValueRef.current !== value) {
      syncToLocalStorage(value);
    }
  });
  return [value, setValue] as const;
};

const AEditor = () => {
  const [value, setValue] = useLocalStorage<Descendant[]>(
    'lla-comment',
    initialValue(),
  );
  const [v, setV] = useState(1080);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  return (
    <div className="max-w-3xl mr-auto ml-auto mt-32 lla-readonly py-4">
      <LLAEditor
        value={value}
        onChange={setValue}
        readOnly={readOnly}
      ></LLAEditor>
      {/* <CodeElement></CodeElement> */}
      {/* <Table></Table> */}
      {/* <ActionGroup likeCount={100} createdAt={dayjs()}></ActionGroup> */}
      {/* <div className="p-4 lla-comment__extra-action-group__target">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Soluta laborum
        nostrum praesentium dolorem blanditiis, magnam veniam ipsa minus quidem
        quo repellendus similique unde porro provident consectetur quibusdam,
        delectus deleniti fuga?
        <ExtraActionGroup></ExtraActionGroup>
      </div> */}
      {/* <UserInfoProvider user={user} onUserChange={setUser}>
        <CommentList
          resourceId="1"
          appId="wechat"
          resourceType="article"
          user={{
            id: 1,
            avatar:
              'https://lla-doc.oss-cn-beijing.aliyuncs.com/image/431629085709_.pic.jpg',
            nickName: 'zhujianshi',
          }}
        ></CommentList>
      </UserInfoProvider> */}
      {/* <LoginModal appId="ead4c75f-0470-4fba-9ccb-e06851d7951e" onUserChange={setUser}></LoginModal> */}

      {/* <Try></Try> */}
      {/* <Paginator totalCount={100} pageSize={10}></Paginator> */}
      {/* <CommentEditor
        // isInComment
        user={{

        }}
      ></CommentEditor> */}
      {/* <ReplyList id="hello world"></ReplyList> */}
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
    children: [{ children: [{ text: 'cosnt ' }], type: 'codeline' }],
    language: 'javascript',
    type: 'codeblock',
  },
  {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    type: 'text-block',
  },
  {
    children: [{ text: '' }],
    type: 'table',
    mergeCells: [{ row: 1, col: 3, rowspan: 3, colspan: 3 }],
    data: [
      ['A1sfsadf', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'],
      ['A1sfsadf', 'B2', 'C2', 'D2', null, null, 'G2'],
      ['A1sfsadf', null, 'C3', null, null, null, 'G3'],
      ['A1sfsadf', null, 'C4', null, null, null, 'G4'],
      ['A1sfsadf', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'],
      ['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'],
      ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'],
    ],
  },
];

export default PlainTextExample;
