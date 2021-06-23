import { Editor } from 'slate';
import { IndentContainer } from '@lla-editor/indent';
import { QuoteElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isContainable, isIndentable, isParagraphable } = e;

  e.isContainable = (n) => {
    if (QuoteElement.is(n)) return false;
    if (isContainable) return isContainable(n);
    return false;
  };

  e.isParagraphable = (n) => {
    if (QuoteElement.is(n)) return true;
    if (isParagraphable) return isParagraphable(n);
    return false;
  };

  e.isIndentable = (n) => {
    if (QuoteElement.is(n)) return true;
    if (isIndentable) return isIndentable(n);
    return false;
  };

  return e;
};
