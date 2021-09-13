import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createShared } from '@zhujianshi/use-lens';
import { createClientWithLink } from './gql';
import useSWR from 'swr';
import { LoginModal } from './LoginModal';

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

export const {
  SharedProvider: UserInfoProviderImpl,
  useLens: useUserInfo,
  useSetLens: useSetUserInfo,
} = createShared<{
  user: User;
}>({});

const RequestLoginModalContext = React.createContext(() => {});
export const useRequestLoginModal = () =>
  React.useContext(RequestLoginModalContext);

const DirectUser: React.FC<{
  appId: string;
  direct: Omit<User, 'accessToken'>;
  serverURL?: string;
}> = ({ appId, direct, children, serverURL = 'http://localhost:7001' }) => {
  const { data, revalidate } = useSWR(
    [`${serverURL}/auth/direct`, appId, direct.id],
    (url: string, appId: string, appUserId: string) =>
      fetch(`${url}/${appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appUserId,
          nickName: direct.nickName,
          avatar: direct.avatar,
        }),
      }).then((res) => res.json()),
  );
  return (
    <UserInfoProvider user={data || null} onUserChange={revalidate}>
      {children}
    </UserInfoProvider>
  );
};

export const LLACommentUser: React.FC<{
  appId: string;
  direct?: Omit<User, 'accessToken'>;
  serverURL?: string;
}> = ({ direct, appId, children, serverURL }) => {
  const [isShow, setIsShow] = React.useState(false);
  const [userByOauth, setUserByOauth] = React.useState<User | null>(null);

  let _children;
  if (direct && !userByOauth) {
    _children = (
      <DirectUser appId={appId} direct={direct} serverURL={serverURL}>
        {children}
        <LoginModal
          isShow={isShow}
          onClose={() => setIsShow(false)}
          appId={appId}
          onUserChange={setUserByOauth}
        ></LoginModal>
      </DirectUser>
    );
  } else {
    _children = (
      <UserInfoProvider
        user={userByOauth}
        onUserChange={() => setUserByOauth(null)}
      >
        {children}
        <LoginModal
          isShow={isShow}
          onClose={() => setIsShow(false)}
          appId={appId}
          onUserChange={(v) => {
            setUserByOauth(v);
            setIsShow(false);
          }}
        ></LoginModal>
      </UserInfoProvider>
    );
  }
  return (
    <RequestLoginModalContext.Provider
      value={React.useCallback(() => setIsShow(true), [])}
    >
      {_children}
    </RequestLoginModalContext.Provider>
  );
};

const UserInfoProvider: React.FC<{
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
      if ((networkError as any) === '401' && onUserChangeRef.current) {
        onUserChangeRef.current(null);
      }
    });
    return [
      createClientWithLink(authLink, onTokenExpiredError),
      user ? { user } : {},
    ] as const;
  }, [user]);
  console.log(
    '%c [ user ]',
    'font-size:13px; background:pink; color:#bf2c9f;',
    realUser,
  );

  return (
    <UserInfoProviderImpl value={realUser} initialValue={realUser}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </UserInfoProviderImpl>
  );
};
