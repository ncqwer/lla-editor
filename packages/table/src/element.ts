import { BaseAtom, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';
import React from 'react';

export type ChangeSource =
  | 'auto'
  | 'edit'
  | 'loadData'
  | 'populateFromArray'
  | 'spliceCol'
  | 'spliceRow'
  | 'timeValidate'
  | 'dateValidate'
  | 'validateCells'
  | 'Autofill.fill'
  | 'ContextMenu.clearColumns'
  | 'ContextMenu.columnLeft'
  | 'ContextMenu.columnRight'
  | 'ContextMenu.removeColumn'
  | 'ContextMenu.removeRow'
  | 'ContextMenu.rowAbove'
  | 'ContextMenu.rowBelow'
  | 'CopyPaste.paste'
  | 'UndoRedo.redo'
  | 'UndoRedo.undo'
  | 'ColumnSummary.set'
  | 'ColumnSummary.reset';

export interface MergeCellCoords {
  col: number;
  row: number;
}
export interface MergeCellRange {
  highlight: MergeCellCoords;
  from: MergeCellCoords;
  to: MergeCellCoords;
}

export type CellChange = [number, string | number, any, any];

export interface MergeSetting {
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
}

export interface HTableComponentProps {
  colHeaders: boolean;
  rowHeaders: boolean;
  width: string;
  height: string;
  undo: boolean;
  data: any[][];
  mergeCells: MergeSetting[];
  afterChange: (_changes: CellChange[] | null, source: ChangeSource) => void;
  afterRemoveCol: (_index: number, amount: number, idxs: number[]) => void;
  afterRemoveRow: (
    _index: number,
    amount: number,
    idxs: number[],
    // source: Handsontable.ChangeSource,
  ) => void;
  afterCreateCol: (index: number) => void;
  afterCreateRow: (index: number) => void;
  beforeMergeCells: (cellRange: MergeCellRange, auto: boolean) => void;
  afterUnmergeCells: (cellRange: MergeCellRange, auto: boolean) => void;
  readOnly?: boolean;
  contextMenu: boolean;
}

const _TYPE_ = 'table' as const;
export interface TableElement extends BaseAtom {
  type: typeof _TYPE_;
  data: any[][];
  mergeCells: MergeSetting[];
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
      data: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((v) =>
        Array.from({ length: 7 }, (_, i) => `${v}${i}`),
      ),
    };
  },
};

const _fowwardType_helper_func = React.forwardRef<any, HTableComponentProps>(
  null as any,
);

// type HTableComponent =  React.ForwardRefExoticComponent<React.PropsWithoutRef<HTableComponentProps> & React.RefAttributes<any>>;
type HTableComponent = typeof _fowwardType_helper_func;

// export interface TableConfig

declare module '@lla-editor/core' {
  interface CustomAtom {
    TableElement: TableElement;
  }
  interface LLAConfig {
    table: {
      HTableComponent: HTableComponent;
    };
  }
}
