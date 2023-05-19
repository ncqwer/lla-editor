import { Editor } from 'slate';
import '@lla-editor/indent';
import { QuoteElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const {
    isContainable,
    isIndentable,
    isParagraphable,
    isBgColorable,
    isTxtColorable,
  } = e;

  e.isBgColorable = (n) => {
    if (QuoteElement.is(n)) return true;
    if (isBgColorable) return isBgColorable(n);
    return false;
  };
  e.isTxtColorable = (n) => {
    if (QuoteElement.is(n)) return true;
    if (isTxtColorable) return isTxtColorable(n);
    return false;
  };

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
