import React from 'react';
import { useSlateStatic, useSlate } from 'slate-react';
import { Path, Transforms, Editor, Text, Descendant } from 'slate';
import { LLAElement, useDebounce } from '@lla-editor/core';

import { User, UserAvatar, useRequestLoginModal, useUserInfo } from './User';
import { createInitialValue, RawEditor, RawEditable } from '@lla-editor/editor';
import { useLens } from './CommentList';

export const CommmentEditorContext = React.createContext<{
  commentId?: string;
  replyId?: string;
  targetAuthorName?: string;
}>({});

export const CommentEditor: React.FC<{
  createComment: (
    authorId: number,
    brief: Descendant[],
    fullContent?: Descendant[],
  ) => Promise<void>;
}> = ({ createComment }) => {
  const [value, setValue] = React.useState(createInitialValue);
  const [user] = useUserInfo(['user']);

  const openLoginModal = useRequestLoginModal();
  if (!user)
    return (
      <div
        className={`flex rounded items-center justify-center bg-gray-100 p-4 text-sm`}
      >
        请
        <span
          className={`mx-1 px-2 py-0.5 rounded cursor-pointer bg-blue-400 text-white`}
          onClick={openLoginModal}
        >
          登录
        </span>
        后发表评论
      </div>
    );
  return (
    <div className="lla-comment__editor-wrapper">
      <UserAvatar user={user}></UserAvatar>
      <RawEditor value={value} onChange={setValue}>
        <div className="lla-comment__editor">
          <ArticleToolbar></ArticleToolbar>
          <RawEditable></RawEditable>
          <div
            className="lla-comment__editor__save-action"
            role="button"
            onClick={handleCreateComment}
          >
            评论
          </div>
        </div>
      </RawEditor>
    </div>
  );

  async function handleCreateComment() {
    const brief = getBriefFromFullContent(value);
    await createComment(
      user.id,
      brief,
      brief.length === value.length ? undefined : value,
    );
    setValue(createInitialValue());
  }
};

export const ReplyEditor: React.FC<{
  createReply: (
    authorId: number,
    brief: Descendant[],
    fullContent?: Descendant[],
    targetReplyId?: number,
  ) => Promise<void>;
}> = ({ createReply }) => {
  const [value, setValue] = React.useState(createInitialValue);
  const [user] = useUserInfo(['user']);

  const [replyInfo, setReplyInfo] = useLens(['replyInfo']);
  const { targetAuthorName, targetReplyId } = replyInfo;
  const openLoginModal = useRequestLoginModal();
  if (!user)
    return (
      <div
        className={`flex rounded items-center justify-center bg-gray-100 p-4 text-sm`}
      >
        请
        <span
          className={`mx-1 px-2 py-0.5 rounded cursor-pointer bg-blue-400 text-white`}
          onClick={openLoginModal}
        >
          登录
        </span>
        后发表评论
      </div>
    );

  return (
    <div className="lla-comment__editor-wrapper">
      <UserAvatar user={user}></UserAvatar>
      <RawEditor value={value} onChange={setValue}>
        <div className="lla-comment__editor">
          <ArticleToolbar></ArticleToolbar>
          <RawEditable></RawEditable>
          <div
            className="lla-comment__editor__save-action"
            role="button"
            onClick={handleCreateReply}
          >
            {targetAuthorName ? `回复@${targetAuthorName}` : '评论'}
          </div>
        </div>
      </RawEditor>
    </div>
  );

  async function handleCreateReply() {
    const brief = getBriefFromFullContent(value, 2);
    await createReply(
      user.id,
      brief,
      brief.length === value.length ? undefined : value,
      targetReplyId,
    );
    setReplyInfo({} as any);
  }
};

const isStyleActive = (texts: Text[], mark: string) =>
  texts.every((t) => !!t[mark]);

const StyleButtonGroup = () => {
  const editor = useSlate();
  const [activeMap, setActiveMap] = React.useState<Record<string, boolean>>({});
  const [getActiveMap] = useDebounce(calcActiveMap, 100);
  React.useEffect(() => {
    getActiveMap();
  });
  return (
    <>
      <div
        className={`icon${activeMap?.bold ? ' icon--active' : ''}`}
        onMouseDown={handleStyle('bold')}
      >
        <span className="iconfont icon-editor-bold text-sm"></span>
        <span className="label text-xs">黑体</span>
      </div>
      <div
        className={`icon${activeMap?.italic ? ' icon--active' : ''}`}
        onMouseDown={handleStyle('italic')}
      >
        <span className="iconfont icon-editor-italic text-sm"></span>
        <span className="label text-xs">斜体</span>
      </div>
      <div
        className={`icon${activeMap?.underline ? ' icon--active' : ''}`}
        onMouseDown={handleStyle('underline')}
      >
        <span className="iconfont icon-editor-underline text-sm"></span>
        <span className="label text-xs">下划线</span>
      </div>
      <div
        className={`icon${activeMap?.lineThrough ? ' icon--active' : ''}`}
        onMouseDown={handleStyle('lineThrough')}
      >
        <span className="iconfont icon-editor-strikethrough text-sm"></span>
        <span className="label text-xs">删除线</span>
      </div>
    </>
  );

  function handleStyle(key: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      if (activeMap?.[key]) return Editor.removeMark(editor, key);
      else return Editor.addMark(editor, key, true);
    };
  }

  function calcActiveMap() {
    const { selection } = editor;
    if (!selection) return;
    const texts = Array.from(
      Editor.nodes(editor, { at: selection, match: Text.isText }),
    ).map(([t]) => t);
    // console.log(texts);
    setActiveMap({
      bold: isStyleActive(texts, 'bold'),
      italic: isStyleActive(texts, 'italic'),
      lineThrough: isStyleActive(texts, 'lineThrough'),
      underline: isStyleActive(texts, 'underline'),
    });
  }
};

export const ArticleToolbar = () => {
  const editor = useSlateStatic();
  return (
    <div
      className="lla-commment__editor-toolbar"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Transforms.select(editor, editor.selection);
      }}
    >
      <StyleButtonGroup></StyleButtonGroup>
      <div className="icon" onMouseDown={handleCommand('task')}>
        <span className="iconfont icon-editor-task-list text-sm"></span>
        <span className="label text-xs">任务列表</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('order')}>
        <span className="iconfont icon-editor-order-list text-sm"></span>
        <span className="label text-xs">有序列表</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('unorder')}>
        <span className="iconfont icon-editor-unorder-list text-sm"></span>
        <span className="label text-xs">无序列表</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('image')}>
        <span className="iconfont icon-editor-image text-sm"></span>
        <span className="label text-xs">图片</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('audio')}>
        <span className="iconfont icon-editor-audio text-sm"></span>
        <span className="label text-xs">音频</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('video')}>
        <span className="iconfont icon-editor-video text-sm"></span>
        <span className="label text-xs">视频</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('quote')}>
        <span className="iconfont icon-editor-paragraph text-sm"></span>
        <span className="label text-xs">引言</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('code')}>
        <span className="iconfont icon-editor-code text-sm"></span>
        <span className="label text-xs">代码块</span>
      </div>
      <div className="icon" onMouseDown={handleCommand('callout')}>
        <span className="iconfont icon-editor-appendix text-sm"></span>
        <span className="label text-xs">标注文本</span>
      </div>
    </div>
  );

  function handleCommand(key: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      const [paragraphEntry] = Editor.levels(editor, {
        match: (n): n is LLAElement =>
          LLAElement.is(n) && (n.type === 'paragraph' || editor.isVoid(n)),
      });
      if (!paragraphEntry) return;
      if (editor.isVoid(paragraphEntry[0])) {
        return Editor.withoutNormalizing(editor, () => {
          Transforms.insertNodes(editor, create(key), {
            at: Path.next(paragraphEntry[1]),
          });
          Transforms.select(
            editor,
            Editor.start(editor, Path.next(paragraphEntry[1])),
          );
        });
      }
      const [, path] = paragraphEntry;
      const [parent, parentPath] = Editor.parent(editor, path);
      if (parent.children.length > 1 && editor.isContainable(parent)) {
        //存在包含多端paragraph的情况
        return Editor.withoutNormalizing(editor, () => {
          Transforms.insertNodes(editor, create(key), {
            at: parentPath.concat(1, 0),
          });
          return Transforms.select(
            editor,
            Editor.start(editor, parentPath.concat(1, 0)),
          );
        });
      }
      //将当前转换
      return Editor.withoutNormalizing(editor, () => {
        Transforms.insertNodes(editor, create(key), {
          at: Path.next(parentPath),
        });
        Transforms.select(editor, Editor.start(editor, Path.next(parentPath)));
      });
    };
  }
};

const create = (key: string): any => {
  if (key === 'code') {
    return {
      type: 'codeblock',
      language: 'javascript',
      children: [
        {
          type: 'codeline',
          children: [{ text: '' }],
        },
      ],
    };
  }
  if (key === 'task')
    return {
      type: 'task_list_item',
      check: false,
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    };
  if (key === 'order')
    return {
      type: 'numbered_list_item',
      index: 1,
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    };
  if (key === 'unorder')
    return {
      type: 'bulleted_list_item',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    };
  if (key === 'quote')
    return {
      type: 'quote',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    };
  if (key === 'callout')
    return {
      type: 'callout',
      emoji: '😀',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    };
  if (key === 'video')
    return {
      type: 'video',
      width: 600,
      children: [{ text: '' }],
    };
  if (key === 'image')
    return {
      type: 'image',
      width: 600,
      children: [{ text: '' }],
    };
  if (key === 'audio')
    return {
      type: 'audio',
      children: [{ text: '' }],
    };
};

const getBriefFromFullContent = (
  nodes: Descendant[],
  limitSize: number = 3,
) => {
  let briefLastIndex =
    nodes.findIndex((node: any) => {
      if (node.type !== 'text-block') return true;
      return node.children.length > 1; //存在缩进块
    }) + 1;
  if (briefLastIndex < 1) briefLastIndex = limitSize;
  if (briefLastIndex > limitSize) briefLastIndex = limitSize;
  return nodes.slice(0, briefLastIndex);
};
