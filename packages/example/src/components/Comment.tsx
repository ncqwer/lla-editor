import React from 'react';
import { Descendant } from 'slate';
import { ActionGroup } from './ActionGroup';
import { Content, ContentItem } from './Content';
import { ExtraActionGroup } from './ExtraActionGroup';
import { UserAvatar, UserTitleExtra, User, UserTitle } from './user';
import { ReplyItem } from './Reply';

import { getBrief, getContent } from '../data/comment';
import { ReplyList } from './ReplyList';
import { ReplyEditor, CommmentEditorContext } from './CommentEditor';
import { useLens } from './CommentList';
import { useApolloClient, useMutation } from '@apollo/client';
import { createReply, ReplyFragment } from './gql/reply';
import { showFullContent } from './gql/content';

export interface CommentItem {
  id: number;
  resourceId: string;
  resourceType: String;
  content: ContentItem;
}

export const Comment: React.FC<CommentItem> = ({ id, content }) => {
  const {
    author,
    createdAt,
    isLiked,
    likedUserCount,
    brief,
    hasMore: _hasMore,
    id: contentId,
  } = content;
  const [value, setValue] = React.useState<Descendant[]>(brief);
  const [hasMore, setHasMore] = React.useState<boolean>(_hasMore);
  const [loading, setLoading] = React.useState<boolean>(false);

  const client = useApolloClient();
  return (
    <div className="lla-comment__comment-item">
      <UserAvatar user={author}></UserAvatar>
      <div className="lla-comment__body">
        <div className="lla-comment__extra-action-group__target">
          <div className="lla-comment__user-info">
            <UserTitle user={author}></UserTitle>
            <UserTitleExtra user={author}></UserTitleExtra>
          </div>
          <div
            className={`lla-comment__content${
              hasMore
                ? ' lla-comment__content--brief'
                : ' lla-comment__content--full'
            }`}
          >
            <Content value={value}></Content>
            <div
              className="lla-comment__content__more"
              onClick={async () => {
                try {
                  setLoading(true);
                  const { data } = await client.query({
                    query: showFullContent,
                    variables: {
                      where: {
                        id: contentId,
                      },
                    },
                  });
                  const { content } = data;
                  setValue(content.fullContent);
                  setHasMore(false);
                } finally {
                  setLoading(false);
                }
              }}
              role="button"
            >
              {!loading && (
                <span className="lla-comment__content__more__text">展开</span>
              )}
              {loading && (
                <svg
                  className="animate-spin text-blue-400"
                  viewBox="0 0 1024 1024"
                >
                  <path d="M512.511 21.483c-271.163 0-491.028 219.86-491.028 491.028 0 271.173 219.856 491.03 491.028 491.03 26.554 0 48.08-21.527 48.08-48.08 0-26.554-21.526-48.08-48.08-48.08-218.065 0-394.869-176.804-394.869-394.87 0-218.06 176.813-394.869 394.87-394.869 218.065 0 394.869 176.804 394.869 394.87 0 26.553 21.526 48.08 48.08 48.08 26.553 0 48.08-21.527 48.08-48.08 0-271.173-219.857-491.03-491.03-491.03z"></path>
                </svg>
              )}
            </div>
          </div>
          <ActionGroup
            contentId={contentId}
            createdAt={createdAt}
            likeCount={likedUserCount}
            isLiked={isLiked}
            commentId={id}
            targetAuthorName={author.nickName}
          ></ActionGroup>
          <ExtraActionGroup></ExtraActionGroup>
        </div>
        <ReplyList commentId={id as any}></ReplyList>
      </div>
    </div>
  );
};
