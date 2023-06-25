export const getContent = () => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '本项目使用',
          },
          {
            url: 'https://github.com/ianstormtaylor/slate',
            type: 'link',
            children: [
              {
                text: ' Slate',
              },
            ],
          },
          {
            text: ' 作为基础。旨在打造 React 友好的富文本编辑器。',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'text-block',
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '项目使用 mono repo 架构,使用',
          },
          {
            text: '@lla-editor/core',
            inlineCode: true,
          },
          {
            text: '作为核心，使用插件架构，方便使用过程中的按需引入。',
          },
        ],
      },
    ],
    type: 'text-block',
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '本项目目前实现了一些较为基础的富文本块。示例如下：',
          },
        ],
      },
    ],
    type: 'text-block',
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '嵌套链表',
          },
        ],
      },
    ],
  },
  {
    type: 'bulleted_list_item',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
      {
        children: [
          {
            type: 'bulleted_list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'task_list_item',
                    checked: false,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: '',
                          },
                        ],
                      },
                    ],
                  },
                ],
                type: 'indent_container',
              },
            ],
          },
          {
            type: 'task_list_item',
            checked: false,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                children: [
                  {
                    type: 'numbered_list_item',
                    index: 1,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: '',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'numbered_list_item',
                    index: 2,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: '',
                          },
                        ],
                      },
                    ],
                  },
                ],
                type: 'indent_container',
              },
            ],
          },
          {
            type: 'bulleted_list_item',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
        type: 'indent_container',
      },
    ],
  },
  {
    type: 'bulleted_list_item',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
      {
        children: [
          {
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '普通文字也可以嵌套',
                  },
                ],
              },
              {
                children: [
                  {
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: '嵌套层级没有限制',
                          },
                        ],
                      },
                    ],
                    type: 'text-block',
                  },
                ],
                type: 'indent_container',
              },
            ],
            type: 'text-block',
          },
        ],
        type: 'indent_container',
      },
    ],
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '块间样式',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '使用红色背景和蓝色字体',
          },
        ],
      },
      {
        children: [
          {
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '可以嵌套修改',
                  },
                ],
              },
            ],
            type: 'text-block',
            bgColor: 'bg-green-50',
            txtColor: 'text-yellow-300',
          },
        ],
        type: 'indent_container',
      },
    ],
    type: 'text-block',
    bgColor: 'bg-red-50',
    txtColor: 'text-blue-300',
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'callout',
          },
        ],
      },
    ],
  },
  {
    type: 'callout',
    emoji: '😀',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '代码块',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        children: [
          {
            text: 'const compose = (...funcs)=>funcs.reduce(',
          },
        ],
        type: 'codeline',
      },
      {
        type: 'codeline',
        children: [
          {
            text: '    (acc,func)=>(...args)=>acc(func(...args)));',
          },
        ],
      },
    ],
    language: 'javascript',
    type: 'codeblock',
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Heading',
          },
        ],
      },
    ],
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '图片',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'image',
    width: 700,
    height: 300,
    src: 'https://img1.baidu.com/it/u=1919509102,1927615551&fm=253&fmt=auto&app=120&f=JPEG?w=889&h=500',
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '链接',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
          {
            url: 'https://www.baidu.com',
            type: 'link',
            children: [
              {
                text: '这里是通往百度的地址。',
              },
            ],
          },
          {
            text: ' ',
          },
        ],
      },
    ],
    type: 'text-block',
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '视频',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '支持本地视频和在线视频',
          },
        ],
      },
    ],
    type: 'text-block',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'video',
    width: 1200,
  },
  {
    type: 'heading',
    level: 3,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '音频',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '支持本地音频和在线音频',
          },
        ],
      },
    ],
    type: 'text-block',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'audio',
    width: 1200,
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    ],
    type: 'text-block',
  },
  {
    type: 'divider',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '差不多了，欢迎加入',
          },
          {
            text: 'lla-editor',
            inlineCode: true,
          },
          {
            text: '!!!',
          },
        ],
      },
    ],
    type: 'text-block',
  },
  {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    ],
    type: 'text-block',
  },
];
