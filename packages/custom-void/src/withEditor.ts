import { Editor } from 'slate';
import { CustomVoidElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isVoid } = e;

  e.isVoid = (n) => {
    if (CustomVoidElement.is(n)) return true;
    return isVoid(n);
  };

  return e;
};
