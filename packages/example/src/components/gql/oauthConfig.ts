import { gql } from '@apollo/client';

export const OAuthConfigFragment = {
  list: gql`
    fragment OAuthConfigList on AppOauthConfig {
      config
      type
    }
  `,
};

export const getAllOAuthConfigs = gql`
  query getAllOAuthConfigs($where: AppWhereUniqueInput!) {
    app(where: $where) {
      oauthConfig {
        ...OAuthConfigList
      }
    }
  }
  ${OAuthConfigFragment.list}
`;
