import { Editor } from 'slate';
import { ImageElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isVoid } = e;

  e.isVoid = (n) => {
    if (ImageElement.is(n)) return true;
    return isVoid(n);
  };

  return e;
};
