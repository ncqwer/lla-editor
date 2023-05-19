import { Editor, Element } from 'slate';
import { extractValueFromPlugin } from './utils';

export type InsertInfo = {
  title: string;
  keywords: Array<string | ((v: string) => boolean)>;
  description: string;
  cover?: string;
  category: Array<'basic'>;
  create: (e: Editor) => Element;
};

const parse = ({ keywords, ...others }: InsertInfo) => {
  return {
    ...others,
    keywords: keywords
      .map((keyword) =>
        typeof keyword === 'string'
          ? (v: string) => keyword.startsWith(v)
          : keyword,
      )
      .reduce(
        (acc, k) =>
          (str: string): boolean => {
            if (!str) return true;
            return k(str) ? true : acc(str);
          },
        () => false,
      ),
  };
};

const impl = extractValueFromPlugin((..._infos: InsertInfo[][]) => {
  const infos = _infos.flat().map(parse);
  return {
    searchItems,
  };

  function searchItems(search: string) {
    return infos.filter(({ keywords }) => keywords(search));
  }
});
export default impl;
