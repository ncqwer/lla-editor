// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import type { Descendant } from 'slate';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useDebounce } from '@lla-editor/core';

import { LLAEditor } from '@lla-editor/editor';

// import Handsontable from 'handsontable';
// import { HotTable, HotTableProps } from '@handsontable/react';
// import 'handsontable/dist/handsontable.full.css';
import { LLAEnvironment } from '@lla-editor/editor';

import { SharedProviderPreset } from '@lla-editor/config-preset';
import { getContent } from './data/comment';

const PlainTextExample = () => {
  // return <TryParent></TryParent>;
  return (
    <LLAEnvironment>
      <SharedProviderPreset overlayerId="root">
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
    getContent(),
  );

  return (
    <div className="max-w-3xl mr-auto ml-auto mt-32 lla-readonly py-4">
      <LLAEditor value={value} onChange={setValue}></LLAEditor>
      <div
        className="rounded-full w-16 h-16 fixed bottom-6 right-6 bg-green-300 flex items-center justify-center text-gray-500 hover:text-gray-400 cursor-pointer"
        onClick={() => {
          setValue(getContent());
        }}
      >
        Reset
      </div>
    </div>
  );
};
// const initialValue: () => Descendant[] = () => [
//   {
//     children: [{ type: 'paragraph', children: [{ text: '' }] }],
//     type: 'text-block',
//   },
// ];

export default PlainTextExample;
