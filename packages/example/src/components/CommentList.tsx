import { ApolloProvider, useMutation, useQuery } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createShared } from '@zhujianshi/use-lens';
import dayjs from 'dayjs';
import React from 'react';
import useswr from 'swr';
import { Comment, CommentItem } from './Comment';
import { CommentEditor } from './CommentEditor';
import { createClientWithLink } from './gql';
import {
  CommentFragment,
  createComment,
  getComments,
  getCommentsTotalCount,
} from './gql/comment';
import { getAllOAuthConfigs, OAuthConfigFragment } from './gql/oauthConfig';
import { User } from './User';

export const { SharedProvider, useLens, useSetLens } = createShared<{
  replyInfo: {
    commentId: number;
    targetReplyId?: number;
    targetAuthorName: string;
  };
  isLoginModalShow: boolean;
}>({
  isLoginModalShow: true,
});

export const {
  SharedProvider: UserInfoProviderImpl,
  useLens: useUserInfo,
  useSetLens: useSetUserInfo,
} = createShared<{
  user: User;
}>({});

export const UserInfoProvider: React.FC<{
  user: User | null;
  onUserChange: (user: User | null) => void;
}> = ({ user, onUserChange, children }) => {
  const onUserChangeRef = React.useRef(onUserChange);
  onUserChangeRef.current = onUserChange;
  const [client, realUser] = React.useMemo(() => {
    const { accessToken } = user || {};
    const authLink = setContext((_, { headers }) => {
      return {
        headers: Object.assign(
          {},
          headers,
          accessToken && {
            authorization: `Bearer ${accessToken}`,
          },
        ),
      };
    });
    const onTokenExpiredError = onError(({ networkError }) => {
      if (networkError === '401' && onUserChangeRef.current) {
        onUserChangeRef.current(null);
      }
    });
    return [
      createClientWithLink(authLink, onTokenExpiredError),
      user || {},
    ] as const;
  }, [user]);

  return (
    <UserInfoProviderImpl value={realUser} initialValue={realUser}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </UserInfoProviderImpl>
  );
};

export const CommentList: React.FC<{
  resourceType: string;
  resourceId: string;
  appId: string;
}> = ({ resourceId, resourceType, appId }) => {
  const pageSize = 3;
  // const [skip, setSkip] = React.useState(0);
  const {} = useQuery(getAllOAuthConfigs, {
    variables: {
      where: {
        id: appId,
      },
    },
  });
  const [take, setTake] = React.useState(pageSize);
  const { data: totalCountData } = useQuery(getCommentsTotalCount, {
    variables: {
      where: {
        resourceId: { equals: resourceId },
        resourceType: { equals: resourceType },
        appId: { equals: appId },
      },
    },
  });
  const { data, fetchMore } = useQuery<{ comments: CommentItem[] }>(
    getComments,
    {
      variables: {
        where: {
          resourceId: { equals: resourceId },
          resourceType: { equals: resourceType },
          appId: { equals: appId },
        },
        take,
        skip: 0,
      },
    },
  );
  const [addComment] = useMutation(createComment, {
    update(cache, { data: { createComment: responseData } }) {
      cache.modify({
        fields: {
          [`comments-${appId}-${resourceType}-${resourceId}`]: (
            existingComments = [],
          ) => {
            try {
              const newRef = cache.writeFragment({
                data: responseData,
                fragment: CommentFragment.list,
                fragmentName: 'CommentList',
              });
              return [newRef, ...existingComments];
            } catch (e) {
              console.error(e);
            }
          },
          aggregateComment(existing) {
            console.log(
              '%c [ existing ]',
              'font-size:13px; background:pink; color:#bf2c9f;',
              existing,
            );
          },
        },
      });
    },
  });
  const sharedValue = React.useMemo(() => ({}), []);
  if (!data || !totalCountData)
    return <div className="lla-comment__comments-wrapper">loading</div>;
  const { comments } = data;
  const {
    aggregateComment: {
      _count: { id: totalCount },
    },
  } = totalCountData;
  return (
    <SharedProvider initialValue={sharedValue}>
      <div>共{totalCount}条回复</div>
      <div className={`lla-comment__comments-wrapper`}>
        <CommentEditor
          createComment={async (userId, brief, fullContent) => {
            addComment({
              variables: {
                data: {
                  resourceType,
                  resourceId,
                  appId,
                  content: {
                    create: {
                      brief,
                      author: {
                        connect: {
                          id: userId,
                        },
                      },
                      hasMore: !!fullContent,
                      fullContent,
                    },
                  },
                },
              },
            });
          }}
        ></CommentEditor>
        <div className="lla-comment__comments">
          {comments.map((comment) => (
            <Comment {...comment} key={comment.id}></Comment>
          ))}
        </div>
        {comments.length < totalCount && (
          <div
            className="lla-comment__comments__footer"
            onClick={async () => {
              const currentLength = comments.length;
              const { data } = await fetchMore({
                variables: {
                  skip: currentLength,
                },
              });
              setTake(currentLength + (data as any).comments.length);
            }}
          >
            <span className="lla-comment__comments__fetchMore">更多</span>
          </div>
        )}
        {/*<div className="lla-comment__comments__paginator">
          <span>共${Math.round(totalCount / 10 + 0.5)}</span>
          <span>当前页面</span>
          <span>下一页</span>
        </div> */}
      </div>
    </SharedProvider>
  );
};
