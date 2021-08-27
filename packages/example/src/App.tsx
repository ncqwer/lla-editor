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

const availableLanguage = Object.entries({
  c: ['c'],
  py: ['python', 'py'],
  java: ['java'],
  cpp: ['cpp', 'c++'],
  'c#': ['csharp', 'cs', 'dotnet'],
  vb: ['visual-basic', 'vb', 'vba'],
  jsx: ['javascript', 'js', 'jsx'],
  tsx: ['typescript', 'ts', 'tsx'],
  php: ['php'],
  wasm: ['wasm'],
  sql: ['sql'],
  markup: ['markup'],
  html: ['html', 'svg'],
  hs: ['haskell', 'hs'],
  css: ['css'],
}).reduce(
  (acc, [k, v]) => ({
    ...acc,
    [v[0] as string]: {
      label: k,
      test: (str: string) => v.some((alias) => alias.startsWith(str)),
    },
  }),
  {} as Record<string, { label: string; test: (str: string) => boolean }>,
);

const alignOpts = { points: ['tl', 'bl'] };
const LanguageSelector = () => {
  const [language, onLanguageChange] = React.useState('java');
  const ref = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const getSearchResult = () => {
    if (!search) return Object.entries(availableLanguage);
    return Object.entries(availableLanguage).filter(([_, { test }]) =>
      test(search),
    );
  };
  React.useEffect(() => {
    getSearchResult();
    setTimeout(() => setIsOpen(true), 200);
  }, []);
  return (
    <>
      <div
        ref={ref}
        className="lla-code-language"
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {availableLanguage[language].label}
        <svg viewBox="0 0 30 30">
          <polygon points="15,17.4 4.8,7 2,9.8 15,23 28,9.8 25.2,7 "></polygon>
        </svg>
      </div>
      {isOpen && (
        <LLAOverLayer
          onClose={() => setIsOpen(false)}
          targetGet={() => ref.current}
          alignOpts={alignOpts}
        >
          <div className="lla-code-language__menu">
            <div className="lla-code-language__search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="lla-code-language__item-group">
              {renderLanguage()}
            </div>
          </div>
        </LLAOverLayer>
      )}
    </>
  );

  function renderLanguage() {
    return (
      <div>
        {getSearchResult()?.map(([type]) => (
          <div
            key={type}
            className="lla-code-language__item"
            onClick={() => {
              onLanguageChange(type);
              setIsOpen(false);
            }}
            onTouchStart={() => {
              onLanguageChange(type);
              setIsOpen(false);
            }}
          >
            {type}
          </div>
        ))}
      </div>
    );
  }
};

const CodeElement = () => {
  return (
    <div className={`lla-code-block`}>
      <LanguageSelector></LanguageSelector>
      <div className={`lla-code-action-group`}></div>
      <pre className={`code language-javascript`}>
        <code>
          <CodeLineElement></CodeLineElement>
          <CodeLineElement></CodeLineElement>
        </code>
      </pre>
    </div>
  );
};

const tableSetting: HotTableProps = {
  colHeaders: true,
  rowHeaders: true,
  width: 'auto',
  height: 'auto',
  undo: false,
  mergeCells: true,
  contextMenu: true,
  licenseKey: 'non-commercial-and-evaluation',
};

const Table = () => {
  const [data, onDataChange] = React.useState(() =>
    Handsontable.helper.createSpreadsheetData(7, 7),
  ); //值得注意的是，已引用的方式来修改了值。
  const [mergeCells, onMergeCellsChange] = React.useState<
    Handsontable.mergeCells.Settings[]
  >([]);
  console.log(
    '%c [ data ]',
    'font-size:13px; background:pink; color:#bf2c9f;',
    data,
  );
  console.log(
    '%c [ mergeCells ]',
    'font-size:13px; background:pink; color:#bf2c9f;',
    mergeCells,
  );

  const hotTableComponentRef = React.useRef<HotTable | null>(null);
  return (
    <div className="lla-table select-none" contentEditable={false}>
      <HotTable
        ref={hotTableComponentRef}
        {...tableSetting}
        // settings={React.useMemo(
        //   () => ({
        //     ...tableSetting,
        //     mergeCells,
        //     data,
        //   }),
        //   [],
        // )}
        data={data}
        mergeCells={mergeCells}
        // beforeChange={(...args) => console.log(...args)}
        beforeChange={handleBeforeChange}
        beforeRemoveCol={handleRemoveCol}
        beforeRemoveRow={handleRemoveRow}
        beforeCreateCol={handleCreateCol}
        beforeCreateRow={handleCreateRow}
        beforeMergeCells={handleMergedCell}
        beforeUnmergeCells={handleUnmerge}
      ></HotTable>
    </div>
  );

  function handleRemoveCol(
    _index: number,
    amount: number,
    idxs: number[],
    // source: Handsontable.ChangeSource,
  ) {
    unstable_batchedUpdates(() => {
      onDataChange((prev) =>
        prev.map((col) => {
          const cache = idxs.reduce(
            (acc, idx) => ({ ...acc, [idx]: true }),
            {},
          );
          const newCol = col.filter((_: any, idx: number) => !cache[idx]);
          return newCol;
        }),
      );
      onMergeCellsChange((prev) => applyMergeForRemoveCol(prev, idxs));
    });
    return false;
  }

  function handleCreateRow(index: number) {
    unstable_batchedUpdates(() => {
      onDataChange((prev) => {
        const newData = [...prev];
        newData.splice(index, 0, Array(prev[0].length).fill(null));
        return newData;
      });
      onMergeCellsChange((prev) => applyMergeForAddRow(prev, index));
    });

    return false;
  }
  function handleCreateCol(index: number) {
    unstable_batchedUpdates(() => {
      onDataChange((prev) =>
        prev.map((col) => {
          const newCol = [...col];
          newCol.splice(index, 0, null);
          return newCol;
        }),
      );
      onMergeCellsChange((prev) => applyMergeForAddCol(prev, index));
    });
    return false;
  }

  function handleRemoveRow(
    _index: number,
    amount: number,
    idxs: number[],
    // source: Handsontable.ChangeSource,
  ) {
    unstable_batchedUpdates(() => {
      const cache = idxs.reduce((acc, idx) => ({ ...acc, [idx]: true }), {});
      onDataChange((prev) => prev.filter((_, i) => !cache[i]));
      onMergeCellsChange((prev) => applyMergeForRemoveRow(prev, idxs));
    });
    return false;
  }

  function handleMergedCell(
    cellRange: Handsontable.wot.CellRange,
    auto: boolean,
  ) {
    if (auto) return;
    onMergeCellsChange((prev) => {
      const nV = applyMergeForMerge(prev, cellRange);
      return nV;
    });
    return false;
  }

  function handleBeforeChange(
    changes: Handsontable.CellChange[],
    source: Handsontable.ChangeSource,
  ) {
    if (source === 'edit' || source === 'Autofill.fill') {
      onDataChange((prev) => {
        const newData = [...prev];

        changes.forEach(([row, column, oldValue, newValue]) => {
          newData[row][column] = newValue;
        });

        return newData;
      });
      return false;
    }
  }

  function handleUnmerge(cellRange: Handsontable.wot.CellRange, auto: boolean) {
    if (auto) return;
    onMergeCellsChange((prev) => {
      const idx = prev.findIndex(
        ({ row, col }) =>
          row === cellRange.from.row && col === cellRange.to.col,
      );
      if (!~idx) return prev;
      const nV = [...prev];
      nV.splice(idx, 1);
      return nV;
    });
    return false;
  }
};

function mergeInclude(
  lhs: Handsontable.wot.CellRange,
  rhs: Handsontable.mergeCells.Settings,
) {
  return (
    lhs.from.col <= rhs.col &&
    lhs.from.row <= rhs.row &&
    lhs.to.col >= rhs.col + rhs.colspan - 1 &&
    lhs.to.row >= rhs.row + rhs.rowspan - 1
  );
}

function applyMergeForMerge(
  mergeCells: Handsontable.mergeCells.Settings[],
  cellRange: Handsontable.wot.CellRange,
) {
  const newMergeCells = mergeCells.filter((m) => !mergeInclude(cellRange, m));
  return newMergeCells.concat({
    row: cellRange.from.row,
    col: cellRange.from.col,
    rowspan: cellRange.to.row - cellRange.from.row + 1,
    colspan: cellRange.to.col - cellRange.from.col + 1,
  });
}

function applyMergeForRemoveCol(
  mergeCells: Handsontable.mergeCells.Settings[],
  colIdxs: number[],
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width-1
    return 1; // begin-1
  };
  return mergeCells
    .map((cellMeta) => {
      return colIdxs
        .map((idx) => getMergeCellStatus(cellMeta.col, cellMeta.colspan, idx))
        .reduce((acc, status) => {
          if (status === -1) return { ...acc, colspan: acc.colspan - 1 };
          if (status === 1) return { ...acc, col: acc.col - 1 };
          return acc;
        }, cellMeta);
    })
    .filter(({ colspan, rowspan }) => !(colspan === 1 && rowspan === 1));
}

function applyMergeForRemoveRow(
  mergeCells: Handsontable.mergeCells.Settings[],
  rowIdxs: number[],
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width-1
    return 1; // begin-1
  };
  return mergeCells
    .map((cellMeta) => {
      return rowIdxs
        .map((idx) => getMergeCellStatus(cellMeta.row, cellMeta.rowspan, idx))
        .reduce((acc, status) => {
          if (status === -1) return { ...acc, rowspan: acc.rowspan - 1 };
          if (status === 1) return { ...acc, row: acc.row - 1 };
          return acc;
        }, cellMeta);
    })
    .filter(({ colspan, rowspan }) => !(colspan === 1 && rowspan === 1));
}

function applyMergeForAddCol(
  mergeCells: Handsontable.mergeCells.Settings[],
  colIdx: number,
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width+1
    return 1; // begin+1
  };
  return mergeCells.map((cellMeta) => {
    const status = getMergeCellStatus(cellMeta.col, cellMeta.colspan, colIdx);
    if (status === -1) return { ...cellMeta, colspan: cellMeta.colspan + 1 };
    if (status === 1) return { ...cellMeta, col: cellMeta.col + 1 };
    return cellMeta;
  });
}

function applyMergeForAddRow(
  mergeCells: Handsontable.mergeCells.Settings[],
  rowIdx: number,
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width+1
    return 1; // begin+1
  };
  return mergeCells.map((cellMeta) => {
    const status = getMergeCellStatus(cellMeta.row, cellMeta.rowspan, rowIdx);
    if (status === -1) return { ...cellMeta, rowspan: cellMeta.colspan + 1 };
    if (status === 1) return { ...cellMeta, row: cellMeta.row + 1 };
    return cellMeta;
  });
}

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

const AEditor = () => {
  const [value, setValue] = useState<Descendant[]>(initialValue());
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
