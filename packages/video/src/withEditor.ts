import { Editor } from 'slate';
import { VideoElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isVoid } = e;

  e.isVoid = (n) => {
    if (VideoElement.is(n)) return true;
    return isVoid(n);
  };

  return e;
};
