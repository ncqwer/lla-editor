import React from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useLens, useSetLens } from './CommentList';
import { useMutation } from '@apollo/client';
import { likeContent, unLikeContent } from './gql/content';
import { useRequestLoginModal, useUserInfo } from './User';

dayjs.extend(customParseFormat);

export const ActionGroup: React.FC<{
  createdAt: Date;
  likeCount: number;
  isLiked?: boolean;
  contentId: number;
  commentId: number;
  replyId?: number;
  targetAuthorName: string;
  isMobile?: boolean;
}> = ({
  createdAt,
  likeCount,
  isLiked: _isLiked = false,
  commentId,
  replyId,
  contentId,
  targetAuthorName,
  isMobile = false,
}) => {
  const createdAtString = dayjs(createdAt).format('YYYY-MM-DD HH:mm');
  const setReplyInfo = useSetLens(['replyInfo']);
  const [user] = useUserInfo(['user']);
  const [isLiked, setIsLiked] = React.useState(_isLiked);
  const openLoginModal = useRequestLoginModal();
  const [likeAction] = useMutation(likeContent, {
    variables: {
      contentId,
    },
    onCompleted({ like }) {
      if (like) setIsLiked(true);
    },
  });
  const [unLikeAction] = useMutation(unLikeContent, {
    variables: {
      contentId,
    },
    onCompleted({ unlike }) {
      if (unlike) setIsLiked(false);
    },
  });
  return (
    <div className="lla-comment__action-group">
      {!isMobile && (
        <>
          <div className="lla-comment__createdAt">{createdAtString}</div>
          <div
            className={`lla-comment__like-action${
              isLiked ? ' lla-comment__like-action--active' : ''
            }`}
            onClick={isLiked ? handleUnlike : handleLike}
          >
            <div className="lla-comment__like-action__icon">
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M588.64000033 367.99999967V175.99999967a5.333333 5.333333 0 0 0-2.88-4.693333L423.04000033 87.73333367a5.333333 5.333333 0 0 0-7.146667 2.24l-147.733333 280.533333a5.333333 5.333333 0 0 1-4.693334 2.826667H133.33333333a5.333333 5.333333 0 0 0-5.333333 5.333333v512a5.333333 5.333333 0 0 0 5.333333 5.333333h635.146667a5.333333 5.333333 0 0 0 4.853333-3.093333l164.853333-362.666667a5.333333 5.333333 0 0 0 0.48-2.24V378.66666667a5.333333 5.333333 0 0 0-5.333333-5.333333h-339.413333a5.333333 5.333333 0 0 1-5.28-5.333334zM261.33333333 821.33333367H208.00000033a5.333333 5.333333 0 0 1-5.333334-5.333334V453.33333367a5.333333 5.333333 0 0 1 5.333334-5.333334h53.333333a5.333333 5.333333 0 0 1 5.333333 5.333334v362.666666a5.333333 5.333333 0 0 1-5.333333 5.333334z m602.186667-307.2l-138.293334 304a5.333333 5.333333 0 0 1-4.8 3.093333H346.66666633a5.333333 5.333333 0 0 1-5.333333-5.333333V393.11999967a5.973333 5.973333 0 0 1 0.586667-2.506666l105.6-200.426667a5.333333 5.333333 0 0 1 7.146666-2.24l56.426667 29.013333a5.333333 5.333333 0 0 1 2.88 4.746667V442.66666667a5.333333 5.333333 0 0 0 5.333333 5.333333H858.66666633a5.333333 5.333333 0 0 1 5.333334 5.333334v58.666666a5.333333 5.333333 0 0 1-0.48 2.133334z"></path>
              </svg>
            </div>
            <div className="lla-comment__like-action__count">
              {isLiked ? likeCount + 1 : likeCount}
            </div>
          </div>
        </>
      )}

      <div className="lla-comment__reply-action" onClick={handleReply}>
        <div className="lla-comment__reply-action__icon">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M270.831234 867.949622c-3.869018 0-6.448363-1.289673-10.31738-2.579345-9.027708-3.869018-15.476071-12.896725-15.476071-23.214106V710.609572C159.919395 696.423174 90.277078 617.753149 90.277078 527.476071V340.473552C90.277078 238.589421 174.105793 154.760705 277.279597 154.760705h479.758186c103.173804 0 184.423174 81.24937 184.423174 185.712847v187.002519C941.460957 629.360202 860.211587 709.319899 757.037783 709.319899H450.095718L288.88665 861.501259c-5.15869 3.869018-11.607053 6.448363-18.055416 6.448363z m6.448363-661.602015C202.478589 206.347607 141.86398 266.962217 141.86398 340.473552v187.002519c0 77.380353 68.352645 134.125945 128.967254 134.125944 14.186398 0 25.793451 11.607053 25.793451 25.793451v95.435768l125.098237-118.649874c5.15869-3.869018 11.607053-6.448363 18.055416-6.448363h317.259445C833.128463 657.732997 889.874055 600.987406 889.874055 527.476071V340.473552C889.874055 265.672544 831.838791 206.347607 757.037783 206.347607H277.279597z"
              fill=""
            ></path>
          </svg>
        </div>
        <div className="lla-comment__reply-action__text">回复</div>
      </div>
    </div>
  );

  async function handleLike() {
    if (!user) return openLoginModal();
    likeAction();
  }
  async function handleUnlike() {
    if (!user) return openLoginModal();
    unLikeAction();
  }
  function handleReply() {
    setReplyInfo({
      commentId,
      targetReplyId: replyId,
      targetAuthorName,
    });
  }
};
