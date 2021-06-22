import { Editor } from 'slate';
import { IndentContainer } from '@lla-editor/indent';
import { HeadingElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isContainable, isIndentable, isParagraphable } = e;

  e.isContainable = (n) => {
    if (HeadingElement.is(n)) return false;
    if (isContainable) return isContainable(n);
    return false;
  };

  e.isParagraphable = (n) => {
    if (HeadingElement.is(n)) return true;
    if (isParagraphable) return isParagraphable(n);
    return false;
  };

  e.isIndentable = (n) => {
    if (HeadingElement.is(n)) return true;
    if (isIndentable) return isIndentable(n);
    return false;
  };

  return e;
};
