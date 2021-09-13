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
