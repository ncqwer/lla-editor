import { gql } from '@apollo/client';

export const UserFragment = {
  list: gql`
    fragment UserList on User {
      id
      nickName
      avatar
    }
  `,
};
