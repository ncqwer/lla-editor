import { Editor } from 'slate';
import { Table } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isVoid } = e;

  e.isVoid = (n) => {
    if (Table.is(n)) return true;
    return isVoid(n);
  };

  return e;
};
