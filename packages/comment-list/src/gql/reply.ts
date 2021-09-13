import { gql } from '@apollo/client';

import { ContentFragment } from './content';

export const ReplyFragment = {
  list: gql`
    fragment ReplyList on Reply {
      id
      content {
        ...ContentList
      }
      targetReply {
        content {
          author {
            id
            nickName
          }
        }
      }
    }
    ${ContentFragment.list}
  `,
};

export const getReplies = gql`
  query getReplies($where: ReplyWhereInput, $skip: Int, $take: Int) {
    replies(where: $where, skip: $skip, take: $take, orderBy: { id: desc }) {
      ...ReplyList
    }
  }
  ${ReplyFragment.list}
`;

export const createReply = gql`
  mutation CreateReply($data: ReplyCreateInput!) {
    createReply(data: $data) {
      ...ReplyList
    }
  }
  ${ReplyFragment.list}
`;

export const getRepliesTotalCount = gql`
  query getRepliesTotalCount($where: ReplyWhereInput) {
    aggregateReply(where: $where, orderBy: { id: desc }) {
      _count {
        id
      }
    }
  }
`;
