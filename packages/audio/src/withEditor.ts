import { Editor } from 'slate';
import { AudioElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isVoid } = e;

  e.isVoid = (n) => {
    if (AudioElement.is(n)) return true;
    return isVoid(n);
  };

  return e;
};
