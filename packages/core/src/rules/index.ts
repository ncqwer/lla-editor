import { pluginHelper } from '@herbart-editor/pae';

import onKeyDownResponseZone, {
  OnKeyDownResponseZone,
  OnKeyDownType,
} from './onKeyDownResponseZone';
import decorate, { Decorate } from './decorate';
import isVoid, { IsVoid } from './isVoid';
import renderElement, {
  ElementJSX,
  ExtendRenderElementProps,
  elementRender,
} from './renderElement';
import renderLeaf, { LeafJSX, ExtendRenderLeafProps } from './renderLeaf';
import withEditor, { WithEditor } from './withEditor';
import onKeyDownAlternative, {
  OnKeyDownAlternative,
} from './onKeyDownAlternative';
import onParagraphConvert, { OnParagraphConvert } from './onParagraphConvert';
import insertInfo, { InsertInfo } from './insertInfo';

const rules = {
  onKeyDownResponseZone,
  decorate,
  isVoid,
  renderElement,
  renderLeaf,
  withEditor,
  onKeyDownAlternative,
  onParagraphConvert,
  insertInfo,
};

// readme: 这里需要手动维护导出类型
export interface Plugin {
  onKeyDownResponseZone: OnKeyDownResponseZone;
  decorate: Decorate;
  isVoid: IsVoid;
  renderElement: ElementJSX;
  renderLeaf: LeafJSX;
  withEditor: WithEditor;
  onKeyDownAlternative: OnKeyDownAlternative;
  onParagraphConvert: OnParagraphConvert;
  insertInfo: InsertInfo[];
}

export { elementRender };
// readme: 这里需要手动维护导出类型
export type {
  OnKeyDownType,
  OnKeyDownResponseZone,
  Decorate,
  IsVoid,
  ElementJSX,
  LeafJSX,
  ExtendRenderElementProps,
  ExtendRenderLeafProps,
  OnKeyDownAlternative,
  OnParagraphConvert,
  InsertInfo,
};

export type PluginImpl = Partial<Plugin> & {
  pluginName: string;
};

export const pluginCompose = pluginHelper(rules);

export * from './utils';
