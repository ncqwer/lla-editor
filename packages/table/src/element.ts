import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';
import Handsontable from 'handsontable';

const _TYPE_ = 'table' as const;
export interface TableElement extends BaseAtom {
  type: typeof _TYPE_;
  data: any[][];
  mergeCells: Handsontable.mergeCells.Settings[];
}

export const Table = {
  is(node: Node): node is TableElement {
    const ans = LLAElement.is(node) && node.type === _TYPE_;
    return ans;
  },
  create() {
    return {
      children: [{ text: '' }],
      type: _TYPE_,
      mergeCells: [],
      data: Handsontable.helper.createSpreadsheetData(7, 7),
    };
  },
};

declare module '@lla-editor/core' {
  interface CustomAtom {
    TableElement: TableElement;
  }
}
