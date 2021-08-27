import React from 'react';

export interface User {
  nickName: string;
  avatar?: string;
  accessToken: string;
  id: number;
}

export const UserAvatar: React.FC<{ user: User; isInReply?: boolean }> = ({
  user,
  isInReply = false,
}) => {
  const { avatar, nickName } = user;
  return (
    <div
      className={`lla-comment__user-avatar${
        isInReply ? ' lla-comment__user-avatar--reply' : ''
      }`}
    >
      {avatar && <img src={avatar} alt={`${nickName}'s avatar`} />}
      {!avatar && <span>{nickName[0]}</span>}
    </div>
  );
};

export const UserTitle: React.FC<{ user: User }> = ({ user }) => {
  const { nickName } = user;
  return <div className={`lla-comment__user-title`}>{nickName}</div>;
};

export const UserTitleExtra: React.FC<{ user: User }> = () => {
  return null;
};
