import { gql } from '@apollo/client';

import { UserFragment } from './user';

export const ContentFragment = {
  list: gql`
    fragment ContentList on Content {
      id
      author {
        ...UserList
      }
      createdAt
      likedUserCount
      isLiked
      brief
      hasMore
    }
    ${UserFragment.list}
  `,
  show: gql`
    fragment ContentShow on Content {
      id
      fullContent
    }
  `,
};

export const showFullContent = gql`
  query fullContent($where: ContentWhereUniqueInput!) {
    content(where: $where) {
      ...ContentShow
    }
  }
  ${ContentFragment.show}
`;

export const likeContent = gql`
  mutation likeContent($contentId: Int!) {
    like(contentId: $contentId)
  }
`;

export const unLikeContent = gql`
  mutation unLikeContent($contentId: Int!) {
    unlike(contentId: $contentId)
  }
`;
