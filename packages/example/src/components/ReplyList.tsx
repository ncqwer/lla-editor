import { useMutation, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import React from 'react';
import { ReplyEditor } from './CommentEditor';
import { useLens } from './CommentList';
import {
  createReply,
  getReplies,
  getRepliesTotalCount,
  ReplyFragment,
} from './gql/reply';

import { ReplyItem, Reply } from './Reply';

export const ReplyList: React.FC<{ commentId: number }> = ({ commentId }) => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [take, setTake] = React.useState<number>(3);
  const currentSkip = currentPage * pageSize;
  // const [cursor, setCursor] = React.useState<number | undefined>();
  const [replyCommentId] = useLens(['replyInfo', 'commentId']);
  const { data: totalCountData, refetch } = useQuery(getRepliesTotalCount, {
    variables: {
      where: {
        commentId: { equals: commentId },
        // id: commentId,
      },
    },
  });
  const { data, fetchMore } = useQuery<{ replies: ReplyItem[] }>(getReplies, {
    variables: {
      where: {
        commentId: { equals: commentId },
        // id: commentId,
      },
      skip: currentSkip,
      take,
    },
  });
  const [addReply] = useMutation(createReply, {
    update(cache, { data: { createReply: responseData } }) {
      cache.modify({
        fields: {
          [`replies-${commentId}`]: (existingReplies = []) => {
            try {
              const newRef = cache.writeFragment({
                data: responseData,
                fragment: ReplyFragment.list,
                fragmentName: 'ReplyList',
              });
              return [newRef, ...existingReplies];
            } catch (e) {
              console.error(e);
            }
          },
        },
      });
    },
    onCompleted() {
      refetch();
    },
  });
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  if (!data || !totalCountData)
    return <div className="lla-comment__replies-wrapper">loading</div>;
  const { replies } = data;
  const {
    aggregateReply: {
      _count: { id: totalCount },
    },
  } = totalCountData;
  return (
    <>
      <div
        className={`lla-comment__replies-wrapper${
          isExpanded ? ' lla-comment__replies-wrapper--expanded' : ''
        }`}
      >
        <div className="lla-comment__replies">
          {replies.map((reply) => (
            <Reply {...reply} key={reply.id} commentId={commentId}></Reply>
          ))}
        </div>
        {replies.length > 0 && replies.length < totalCount && (
          <div className="lla-comment__replies__footer">
            <span>共{totalCount}条回复</span>
            <span
              className="lla-comment__replies__expand"
              role="button"
              onClick={async () => {
                const currentLength = replies.length;
                const { data } = await fetchMore({
                  variables: {
                    skip: currentLength,
                    take: pageSize - currentLength,
                  },
                });
                setTake(currentLength + (data as any).replies.length);
                setIsExpanded(true);
              }}
            >
              点击查看
            </span>
          </div>
        )}
        {isExpanded && (
          <Paginator
            totalCount={totalCount}
            pageSize={pageSize}
            currentPageIndex={currentPage}
            onCurrentPageIndexChange={setCurrentPage}
          ></Paginator>
        )}
      </div>
      {replyCommentId === commentId && (
        <ReplyEditor
          createReply={async (authorId, brief, fullContent, targetReplyId) => {
            addReply({
              variables: {
                data: Object.assign(
                  {
                    comment: {
                      connect: { id: commentId },
                    },
                    content: {
                      create: {
                        brief,
                        author: {
                          connect: {
                            id: authorId,
                          },
                        },
                        hasMore: !!fullContent,
                        fullContent,
                      },
                    },
                  },
                  targetReplyId && {
                    targetReply: {
                      connect: { id: targetReplyId },
                    },
                  },
                ),
              },
            });
          }}
        ></ReplyEditor>
      )}
    </>
  );
};

export const Paginator: React.FC<{
  totalCount: number;
  currentPageIndex: number;
  onCurrentPageIndexChange: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
}> = ({ totalCount, currentPageIndex, onCurrentPageIndexChange, pageSize }) => {
  // const [currentPageIndex, onCurrentPageIndexChange] = React.useState(0);
  const [pageArrangement, pageCount] = React.useMemo(
    () => calcPaginator(totalCount, currentPageIndex, pageSize),
    [totalCount, currentPageIndex, pageSize],
  );
  if (pageCount === 1) return null;
  return (
    <div className="lla-comment__replies__paginator">
      <span className="lla-comment__replies__totalCount">共{pageCount}页</span>
      <span className="lla-comment__replies__pageInfo">
        {currentPageIndex > 0 && (
          <span
            className="lla-comment__replies__prev-page"
            onClick={() => onCurrentPageIndexChange(currentPageIndex - 1)}
          >
            上一页
          </span>
        )}
        <span className="lla-comment__replies__pageIndexs">
          {pageArrangement.map((idx, i) => {
            if (idx === null)
              return (
                <span
                  className="lla-comment__replies__pageIndex lla-comment__replies__pageIndex--disabled"
                  key={i}
                >
                  ...
                </span>
              );
            return (
              <span
                className={`lla-comment__replies__pageIndex${
                  currentPageIndex === idx
                    ? ' lla-comment__replies__pageIndex--active'
                    : ''
                }`}
                onClick={() => onCurrentPageIndexChange(idx)}
                key={i}
              >
                {idx + 1}
              </span>
            );
          })}
        </span>
        {currentPageIndex < pageCount && (
          <span
            className="lla-comment__replies__next-page"
            onClick={() => onCurrentPageIndexChange(currentPageIndex + 1)}
          >
            下一页
          </span>
        )}
      </span>
    </div>
  );
};

const calcPaginator = (
  totalCount: number,
  currentPageIndex: number,
  pageSize: number,
) => {
  const pageCount = Math.ceil(totalCount / pageSize);
  return [arrangePage(pageCount, currentPageIndex), pageCount] as const;
  function arrangePage(total: number, current: number) {
    // total < 7 return 0,1,2...,total
    //[0, 1, null, 2, 43, 44, 45, 97, null, 98, 99] f(100,44)
    //[0, 1, 2, 3, 5, null, 6, 7] f(8,2)
    if (total < 7) return Array.from({ length: total }, (_, i) => i);
    const begin = [0, 1, 2];

    const end = [total - 3, total - 2, total - 1];

    const middle = [
      Math.max(0, current - 1),
      current,
      Math.min(total - 1, current + 1),
    ];

    const hasLeftNull = middle[0] - begin[2] > 1;
    const hasRightNull = end[0] - middle[2] > 1;
    const set: Array<number | null> = Array.from(
      new Set([...begin, ...middle, ...end]),
    );

    set.sort((lhs: any, rhs: any) => (lhs < rhs ? -1 : 1));

    if (hasLeftNull) set.splice(3, 0, null);
    if (hasRightNull) set.splice(-3, 0, null);
    return set;
  }
};
