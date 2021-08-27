import { withEditor } from './withEditor';
import render from './render';
// import { onKeyDownResponseZone } from './handler';
import { deserialize, serialize } from './convert';
import { Table } from './element';

export default {
  pluginName: 'table',
  renderElement: render,
  // onKeyDownResponseZone,
  deserialize,
  serialize,
  withEditor,
  // onParagraphConvert,
  // onKeyDownAlternative,
  insertInfo: [
    {
      keywords: ['table'],
      title: '表格',
      description: '表格，用来整理二维数据',
      create: Table.create,
      cover:
        'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/video.png',
    },
  ],
};
