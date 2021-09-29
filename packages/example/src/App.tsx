import React, { useState, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Descendant } from 'slate';
import { ParagraphImpl, useDebounce } from '@lla-editor/core';
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
import LinkImpl from '@lla-editor/link';
import CodeImpl from '@lla-editor/code';
import TableImpl from '@lla-editor/table';
import copy from 'copy-to-clipboard';
import { Example, LLAEditor } from '@lla-editor/editor';

import Handsontable from 'handsontable';
import { HotTable, HotTableProps } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { LLAEnvironment } from '@lla-editor/editor';

import { SharedProviderPreset } from '@lla-editor/config-preset';

import {
  UserAvatar,
  ActionGroup,
  ExtraActionGroup,
  Comment,
  Reply,
  ReplyList,
  CommentList,
  Paginator,
  LLACommentUser,
  LoginModal,
  User,
} from '@lla-editor/comment-list';

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

const PlainTextExample = () => {
  // return <TryParent></TryParent>;
  return (
    <LLAEnvironment>
      <SharedProviderPreset>
        <AEditor></AEditor>
      </SharedProviderPreset>
    </LLAEnvironment>
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

let flag = 0;

const TryGrandson = ({ value }) => {
  React.useEffect(() => {
    console.log('mounted');
    return () => console.log('unmounted');
  }, []);
  return <div>{value}</div>;
};

const TryChild = ({ value }) => {
  console.log('hhh');
  const [num, setNum] = React.useState(value);
  console.log('sss');
  if (num !== value) {
    setNum(value);
    return null;
  }
  console.log(num);
  console.log(
    '%c [ flag ]',
    'font-size:13px; background:pink; color:#bf2c9f;',
    flag++,
  );
  return <TryGrandson value={num}></TryGrandson>;
};

const TryParent = () => {
  const [value, incr] = React.useState(0);
  return (
    <div>
      <TryChild value={value}></TryChild>
      <button
        onClick={async () => {
          await Promise.resolve();
          incr((prev) => prev + 1);
          console.log('jj');
        }}
      >
        plus
      </button>
    </div>
  );
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
      {/* <LLAEditor
        value={value}
        onChange={setValue}
        readOnly={readOnly}
      ></LLAEditor> */}
      {/* <TryParent></TryParent> */}
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
      <LLACommentUser
        appId="3f827c80-0c8d-45fe-b245-b03ca4a45c2c"
        direct={{ id: 1, nickName: 'zhujianshi' }}
      >
        <CommentList
          resourceId="1"
          appId="wechat"
          resourceType="article"
        ></CommentList>
      </LLACommentUser>

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
];

export default PlainTextExample;
