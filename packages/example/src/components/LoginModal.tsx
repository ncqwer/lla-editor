import { useQuery } from '@apollo/client';
import { LLAModal } from '@lla-editor/core';
import React from 'react';
import { useLens } from './CommentList';
import { getAllOAuthConfigs } from './gql/oauthConfig';
import { User } from './User';

export const LoginModal: React.FC<{
  appId: string;
  onUserChange: (user: User | null) => void;
}> = ({ appId }) => {
  const [isShow, setIsShow] = useLens(['isLoginModalShow']);
  const { data } = useQuery(getAllOAuthConfigs, {
    variables: {
      where: {
        id: appId,
      },
    },
  });
  if (!isShow || !data) return null;
  const { oauthConfig } = data.app;
  return (
    <LLAModal onClose={() => setIsShow(false)} hasMask>
      <div className="lla-comment__login-modal">
        {oauthConfig.map(({ config, type }: { config: any; type: string }) => {
          if (type === 'direct')
            return (
              <div
                className="lla-comment__login-item lla-comment__login-item--direct"
                key={type}
              >
                使用本站账号登录
              </div>
            );
          if (type === 'github')
            return (
              <div
                className="lla-comment__login-item lla-comment__login-item--github"
                key={type}
                onClick={async () => {
                  const { clientId } = config;
                  const authorize_uri =
                    'https://github.com/login/oauth/authorize';
                  const redirect_uri = 'http://localhost:7001/auth/github';

                  const url = `${authorize_uri}?client_id=${clientId}&redirect_uri=${redirect_uri}/${appId}`;
                  console.log(
                    '%c [ url ]',
                    'font-size:13px; background:pink; color:#bf2c9f;',
                    url,
                  );
                  // const url = 'http://localhost:54337';
                  const popup = window.open(url);
                  if (!popup) return;
                  let res: any;
                  let intervalId: any;
                  const promise = new Promise((_r) => (res = _r));
                  const handler = (event: MessageEvent) => {
                    if (
                      event.origin === 'http://localhost:7001' &&
                      !!event.data
                    )
                      res(event.data);
                  };
                  window.addEventListener('message', handler);
                  intervalId = setInterval(() => {
                    popup.postMessage(
                      'lla comment system query for user login token',
                      'http://localhost:7001',
                    );
                  }, 1000);
                  const data = await promise;
                  console.log(
                    '%c [ data ]',
                    'font-size:13px; background:pink; color:#bf2c9f;',
                    data,
                  );
                  window.removeEventListener('message', handler);
                  clearInterval(intervalId);
                }}
              >
                使用github登录
              </div>
            );
          if (type === 'wechat')
            return (
              <div
                className="lla-comment__login-item lla-comment__login-item--wechat"
                key={type}
              >
                使用wechat登录
              </div>
            );
        })}
      </div>
    </LLAModal>
  );
};
