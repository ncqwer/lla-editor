import React from 'react';
import { Descendant } from 'slate';
import { getBrief, getContent } from '../data/comment';
import { ActionGroup } from './ActionGroup';
import { Content, ContentItem } from './Content';
import { ExtraActionGroup } from './ExtraActionGroup';
import { User, UserAvatar, UserTitle, UserTitleExtra } from './User';
import useMeasure from 'react-use-measure';
import { showFullContent } from './gql/content';
import { useApolloClient } from '@apollo/client';

export interface ReplyItem {
  commentId: number;
  id: number;
  content: ContentItem;
  targetReply?: any;
}

export const Reply: React.FC<ReplyItem> = ({
  id,
  content,
  targetReply,
  commentId,
}) => {
  const {
    author,
    isLiked,
    likedUserCount,
    createdAt,
    hasMore: _hasMore,
    brief,
    id: contentId,
  } = content;
  const [value, setValue] = React.useState<Descendant[]>(brief);
  const [hasMore, setHasMore] = React.useState<boolean>(_hasMore);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [ref, { width }] = useMeasure();
  const targetReplyAuthorName = targetReply?.content?.author.nickName;
  const client = useApolloClient();
  return (
    <div className="lla-comment__reply-item">
      <UserAvatar user={author} isInReply></UserAvatar>
      <div className="lla-comment__extra-action-group__target lla-comment__reply-body">
        <div
          className={`lla-comment__reply-content${
            hasMore
              ? ' lla-comment__reply-content--brief'
              : ' lla-comment__reply-content--full'
          }`}
          style={React.useMemo<any>(
            () => ({
              '--lla-comment-reply-indent': `${width}px`,
            }),
            [width],
          )}
        >
          <div className="lla-comment__user-info" ref={ref}>
            <UserTitle user={author}></UserTitle>
            <UserTitleExtra user={author}></UserTitleExtra>
            {targetReplyAuthorName && (
              <>
                <span className="lla-comment__replylabel">回复</span>
                <span className="lla-comment__replyto">
                  @-{targetReplyAuthorName}
                </span>
              </>
            )}
          </div>
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
          createdAt={createdAt}
          contentId={contentId}
          likeCount={likedUserCount}
          isLiked={isLiked}
          commentId={commentId}
          replyId={id}
          targetAuthorName={author.nickName}
        ></ActionGroup>
        <ExtraActionGroup></ExtraActionGroup>
      </div>
    </div>
  );
};
