import React from 'react';
import { LLAEditor } from '@lla-editor/editor';
import { Descendant } from 'slate';
import { User } from './User';

export interface ContentItem {
  id: number;
  brief: Descendant[];
  hasMore: boolean;
  fullContent?: Descendant[];
  author: User;
  likedUserCount: number;
  createdAt: any;
  isLiked: boolean;
}

export const Content: React.FC<{ value: any }> = ({ value }) => {
  return (
    <LLAEditor
      value={value}
      readOnly
      onChange={() => {}}
      className="overflow-hidden"
    ></LLAEditor>
  );
};
