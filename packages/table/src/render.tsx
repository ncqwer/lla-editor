import React from 'react';
import Handsontable from 'handsontable';
import { HotTable, HotTableProps } from '@handsontable/react';
import {
  ElementJSX,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
} from '@lla-editor/core';
import { TableElement, Table } from './element';
import { ReactEditor, useReadOnly, useSlateStatic } from 'slate-react';
import { Transforms } from 'slate';

const tableSetting: HotTableProps = {
  colHeaders: true,
  rowHeaders: true,
  width: 'auto',
  height: 'auto',
  undo: false,
  mergeCells: true,
  contextMenu: true,
  licenseKey: 'non-commercial-and-evaluation',
};

const HTable = React.memo(
  ({
    data: _data,
    mergeCells: _mergeCells,
    readOnly = false,
    onChange,
  }: {
    data: any[][];
    mergeCells: Handsontable.mergeCells.Settings[];
    readOnly?: boolean;
    onChange?: (
      data: any[][],
      mergeCells: (
        v: Handsontable.mergeCells.Settings[],
      ) => Handsontable.mergeCells.Settings[],
    ) => void;
  }) => {
    const [data] = React.useState(() => _data.map((v) => [...v])); //值得注意的是，已引用的方式来修改了值。
    const [mergeCells] = React.useState<Handsontable.mergeCells.Settings[]>(
      () => [..._mergeCells],
    );
    const hotTableComponentRef = React.useRef<HotTable | null>(null);
    return (
      <HotTable
        {...tableSetting}
        data={data}
        mergeCells={mergeCells}
        afterChange={handleChange}
        ref={hotTableComponentRef}
        afterRemoveCol={handleRemoveCol}
        afterRemoveRow={handleRemoveRow}
        afterCreateCol={handleCreateCol}
        afterCreateRow={handleCreateRow}
        beforeMergeCells={handleMergedCell}
        afterUnmergeCells={handleUnmerge}
        readOnly={readOnly}
        contextMenu={!readOnly}
      ></HotTable>
    );
    function handleRemoveCol(_index: number, amount: number, idxs: number[]) {
      console.log(
        hotTableComponentRef.current?.__hotInstance?.getSettings()?.data,
      );
      if (!hotTableComponentRef.current?.__hotInstance) return;
      const instance = hotTableComponentRef.current.__hotInstance;
      onChange &&
        onChange(instance.getSettings().data as any, (prev) =>
          applyMergeForRemoveCol(prev, idxs),
        );
      // return false;
    }

    function handleCreateRow(index: number) {
      if (!hotTableComponentRef.current?.__hotInstance) return;
      const instance = hotTableComponentRef.current.__hotInstance;
      onChange &&
        onChange(instance.getSettings().data as any, (prev) =>
          applyMergeForAddRow(prev, index),
        );
      // return false;
    }
    function handleCreateCol(index: number) {
      if (!hotTableComponentRef.current?.__hotInstance) return;
      const instance = hotTableComponentRef.current.__hotInstance;
      onChange &&
        onChange(instance.getSettings().data as any, (prev) =>
          applyMergeForAddCol(prev, index),
        );
      // return false;
    }

    function handleRemoveRow(
      _index: number,
      amount: number,
      idxs: number[],
      // source: Handsontable.ChangeSource,
    ) {
      if (!hotTableComponentRef.current?.__hotInstance) return;
      const instance = hotTableComponentRef.current.__hotInstance;
      onChange &&
        onChange(instance.getSettings().data as any, (prev) =>
          applyMergeForRemoveRow(prev, idxs),
        );
      // return false;
    }

    function handleMergedCell(
      cellRange: Handsontable.wot.CellRange,
      auto: boolean,
    ) {
      if (auto) return;
      if (!hotTableComponentRef.current?.__hotInstance) return;
      const instance = hotTableComponentRef.current.__hotInstance;
      onChange &&
        onChange(instance.getSettings().data as any, (prev) => {
          const nV = applyMergeForMerge(prev, cellRange);
          return nV;
        });
    }

    function handleChange(
      _changes: Handsontable.CellChange[] | null,
      source: Handsontable.ChangeSource,
    ) {
      if (source === 'edit' || source === 'Autofill.fill') {
        if (!hotTableComponentRef.current?.__hotInstance) return;
        const instance = hotTableComponentRef.current.__hotInstance;
        onChange &&
          onChange(instance.getSettings().data as any, (prev) => prev);
        // return false;
      }
    }

    function handleUnmerge(
      cellRange: Handsontable.wot.CellRange,
      auto: boolean,
    ) {
      if (auto) return;
      if (!hotTableComponentRef.current?.__hotInstance) return;
      const instance = hotTableComponentRef.current.__hotInstance;
      onChange &&
        onChange(instance.getSettings().data as any, (prev) => {
          const idx = prev.findIndex(
            ({ row, col }) =>
              row === cellRange.from.row && col === cellRange.from.col,
          );
          if (!~idx) return prev;
          const nV = [...prev];
          nV.splice(idx, 1);
          return nV;
        });
    }
  },
  (prev, next) => prev.readOnly === next.readOnly, // 维持自身状态，仅仅通过ref来获取值
);

const TableComponent: React.FC<ExtendRenderElementProps<TableElement>> = ({
  attributes,
  children,
  element,
}) => {
  const { data, mergeCells } = element;
  const editor = useSlateStatic();
  const isReadOnly = useReadOnly();
  const elementRef = React.useRef<TableElement>(element);
  elementRef.current = element;
  const triggerRef = React.useRef<HTMLDivElement>(null);
  return (
    <div
      className="lla-table lla-context-menu-target"
      {...attributes}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div className="select-none" contentEditable={false}>
        <HTable
          data={data}
          mergeCells={mergeCells}
          readOnly={isReadOnly}
          onChange={(data, mergeCellsF) => {
            const path = ReactEditor.findPath(editor, elementRef.current);
            Transforms.setNodes(
              editor,
              {
                data: data.map((v) => [...v]),
                mergeCells: mergeCellsF(elementRef.current.mergeCells),
              },
              { at: path },
            );
          }}
        ></HTable>
      </div>
      <div
        ref={triggerRef}
        className="lla-context-menu-trigger z-30"
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation();
          openContextMenu();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          openContextMenu();
        }}
      >
        ...
      </div>
      <div className="pointer-events-none">{children}</div>
    </div>
  );
  function openContextMenu() {
    const contextMenu = editor.getOvlerLayer('contextMenu');
    if (contextMenu) {
      contextMenu.open({
        path: ReactEditor.findPath(editor, element),
        element,
        targetGet: () => triggerRef.current,
      });
    }
  }
};

export default [
  [elementPropsIs(Table.is), elementRender(TableComponent)],
] as ElementJSX<TableElement>;

function mergeInclude(
  lhs: Handsontable.wot.CellRange,
  rhs: Handsontable.mergeCells.Settings,
) {
  return (
    lhs.from.col <= rhs.col &&
    lhs.from.row <= rhs.row &&
    lhs.to.col >= rhs.col + rhs.colspan - 1 &&
    lhs.to.row >= rhs.row + rhs.rowspan - 1
  );
}

function applyMergeForMerge(
  mergeCells: Handsontable.mergeCells.Settings[],
  cellRange: Handsontable.wot.CellRange,
) {
  const newMergeCells = mergeCells.filter((m) => !mergeInclude(cellRange, m));
  return newMergeCells.concat({
    row: cellRange.from.row,
    col: cellRange.from.col,
    rowspan: cellRange.to.row - cellRange.from.row + 1,
    colspan: cellRange.to.col - cellRange.from.col + 1,
  });
}

function applyMergeForRemoveCol(
  mergeCells: Handsontable.mergeCells.Settings[],
  colIdxs: number[],
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width-1
    return 1; // begin-1
  };
  return mergeCells
    .map((cellMeta) => {
      return colIdxs
        .map((idx) => getMergeCellStatus(cellMeta.col, cellMeta.colspan, idx))
        .reduce((acc, status) => {
          if (status === -1) return { ...acc, colspan: acc.colspan - 1 };
          if (status === 1) return { ...acc, col: acc.col - 1 };
          return acc;
        }, cellMeta);
    })
    .filter(({ colspan, rowspan }) => !(colspan === 1 && rowspan === 1));
}

function applyMergeForRemoveRow(
  mergeCells: Handsontable.mergeCells.Settings[],
  rowIdxs: number[],
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width-1
    return 1; // begin-1
  };
  return mergeCells
    .map((cellMeta) => {
      return rowIdxs
        .map((idx) => getMergeCellStatus(cellMeta.row, cellMeta.rowspan, idx))
        .reduce((acc, status) => {
          if (status === -1) return { ...acc, rowspan: acc.rowspan - 1 };
          if (status === 1) return { ...acc, row: acc.row - 1 };
          return acc;
        }, cellMeta);
    })
    .filter(({ colspan, rowspan }) => !(colspan === 1 && rowspan === 1));
}

function applyMergeForAddCol(
  mergeCells: Handsontable.mergeCells.Settings[],
  colIdx: number,
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width+1
    return 1; // begin+1
  };
  return mergeCells.map((cellMeta) => {
    const status = getMergeCellStatus(cellMeta.col, cellMeta.colspan, colIdx);
    if (status === -1) return { ...cellMeta, colspan: cellMeta.colspan + 1 };
    if (status === 1) return { ...cellMeta, col: cellMeta.col + 1 };
    return cellMeta;
  });
}

function applyMergeForAddRow(
  mergeCells: Handsontable.mergeCells.Settings[],
  rowIdx: number,
) {
  const getMergeCellStatus = (
    begin: number,
    width: number,
    idx: number,
  ): -1 | 0 | 1 => {
    if (begin + width - 1 < idx) return 0; //do nothing
    if (begin <= idx && idx <= begin + width - 1) return -1; // width+1
    return 1; // begin+1
  };
  return mergeCells.map((cellMeta) => {
    const status = getMergeCellStatus(cellMeta.row, cellMeta.rowspan, rowIdx);
    if (status === -1) return { ...cellMeta, rowspan: cellMeta.colspan + 1 };
    if (status === 1) return { ...cellMeta, row: cellMeta.row + 1 };
    return cellMeta;
  });
}
