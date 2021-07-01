import { Editor, Element } from 'slate';
import {
  nextifyFlow,
  OnKeyDownType,
  pluginCompose,
  PluginImpl,
} from '../rules';

export const composePluginsForTest = (...plugins: PluginImpl[]) => {
  const {
    withEditor,
    onParagraphConvert,
    onKeyDownAlternative,
    onKeyDownResponseZone,
    ...others
  } = pluginCompose(...plugins);
  const w = (baseEditor: Editor): Editor => {
    baseEditor.convertFromParagraph = onParagraphConvert;
    const editor = withEditor(baseEditor);
    return editor;
  };
  const onKeyDown: OnKeyDownType<Element> = (next, event, editor) => {
    const selection = editor.selection;
    if (!selection) return;
    const keyDown = Array.from(
      Editor.levels(editor, { at: selection, reverse: true }),
    ).map((nodeEntry) =>
      onKeyDownResponseZone(() => (next) => next(), nodeEntry),
    );
    return nextifyFlow(...keyDown, (...args) => {
      return onKeyDownAlternative(...args);
    })(next, event, editor);
  };
  return {
    withEditor: w,
    onKeyDown,
    ...others,
  };
};
