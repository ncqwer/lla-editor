import ElementJSX from './render';
import { onKeyDownResponseZone } from './handler';
import { withEditor } from './withEditor';
import { onParagraphConvert } from './convert';
import { List } from './element';

export default {
  pluginName: 'lla-list',
  renderElement: ElementJSX,
  onKeyDownResponseZone,
  withEditor,
  onParagraphConvert,
  insertInfo: [
    {
      keywords: ['list', 'bulleted', 'unorder'],
      title: '无序列表',
      description: '用来表示一组没有比较关系的文本',
      create: List.createBulleted,
    },
    {
      keywords: ['list', 'numberd', 'order'],
      title: '有序列表',
      description: '用来表示一组可比较比较的文本',
      create: List.createNumbered,
    },
    {
      keywords: ['list', 'task', 'todo'],
      title: '任务列表',
      description: '用来表示一组任务目标',
      create: List.createTask,
    },
  ],
};
