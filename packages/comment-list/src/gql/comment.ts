import { gql } from '@apollo/client';

import { ContentFragment } from './content';

export const CommentFragment = {
  list: gql`
    fragment CommentList on Comment {
      id
      content {
        ...ContentList
      }
    }
    ${ContentFragment.list}
  `,
};

export const getComments = gql`
  query getComments($where: CommentWhereInput, $skip: Int, $take: Int) {
    comments(where: $where, skip: $skip, take: $take, orderBy: { id: desc }) {
      ...CommentList
    }
  }
  ${CommentFragment.list}
`;

export const getCommentsTotalCount = gql`
  query getCommentsTotalCount($where: CommentWhereInput) {
    aggregateComment(where: $where, orderBy: { id: desc }) {
      _count {
        id
      }
    }
  }
`;

export const createComment = gql`
  mutation CommentCreate($data: CommentCreateInput!) {
    createComment(data: $data) {
      ...CommentList
    }
  }
  ${CommentFragment.list}
`;
