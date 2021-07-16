import { Deserialize, Serialize } from '@lla-editor/core';
import { LinkElement } from './element';

export const deserialize: Deserialize = (next, ast, editor, acc) => {
  if (ast.type === 'link') {
    return acc.concat({
      ...LinkElement.create(ast.url),
      children: ast.children.reduce(
        (ac: any, v: any) => editor.deserialize(v, editor, ac),
        [],
      ),
    });
  }
  return next();
};

export const serialize: Serialize = (next, ele, editor) => {
  if (LinkElement.is(ele))
    return {
      type: 'link',
      url: ele.url,
      children: ele.children
        .map((v) => editor.serialize(v, editor))
        .filter(Boolean),
    };
  return next();
};
