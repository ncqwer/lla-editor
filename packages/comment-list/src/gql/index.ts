import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  RequestHandler,
  ApolloLink,
} from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';

// import { setContext } from '@apollo/client/link/context';
// import { getAccessToken, getDispatch, updateAccessToken } from '@/utils/tokenHelper';
// import { onError } from '@apollo/client/link/error';
// import { API_SERVER_HOST } from '@/env';

export const createLink = (url: string) =>
  createHttpLink({
    uri: `${url}/graphql` || `http://192.168.31.240:7001/graphql`,
    // uri: `http://yinglian.zhaji.wiki/graphql`,
  });
// const onTokenExpiredError = onError(({ networkError }) => {
//   if (networkError === '401') {
//     updateAccessToken(null);
//     gqlClient.clearStore();
//     const dispatch = getDispatch();
//     if (dispatch)
//       dispatch({
//         type: 'graphqlUser/resetUser',
//       });
//     history.push('/user/login');
//   }
// });

// const authLink = setContext((_, { headers }) => {
//   // get the authentication token from local storage if it exists
//   const token = getAccessToken();
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : '',
//     },
//   };
// });

export const createClientWithLink = (
  ...links: (RequestHandler | ApolloLink)[]
) =>
  new ApolloClient({
    link: from([...links]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            comments: {
              keyArgs: (args) => {
                const { resourceType, resourceId, appId } = args!.where!;
                return `comments-${appId.equals}-${resourceType.equals}-${resourceId.equals}`;
              },
              merge(existing, incoming, { args }) {
                const merged = existing ? existing.slice(0) : [];
                if (args) {
                  // Assume an offset of 0 if args.offset omitted.
                  const { skip = 0 } = args;
                  for (let i = 0; i < incoming.length; ++i) {
                    merged[skip + i] = incoming[i];
                  }
                } else {
                  // It's unusual (probably a mistake) for a paginated field not
                  // to receive any arguments, so you might prefer to throw an
                  // exception here, instead of recovering by appending incoming
                  // onto the existing array.
                  merged.push.apply(merged, incoming);
                }
                return merged;
              },
            },
            replies: {
              keyArgs: (args) => {
                const { commentId } = args!.where!;
                return `replies-${commentId.equals}`;
              },
              merge(existing, incoming, { args }) {
                const merged = existing ? existing.slice(0) : [];
                if (args) {
                  // Assume an offset of 0 if args.offset omitted.
                  const { skip = 0 } = args;
                  for (let i = 0; i < incoming.length; ++i) {
                    merged[skip + i] = incoming[i];
                  }
                } else {
                  // It's unusual (probably a mistake) for a paginated field not
                  // to receive any arguments, so you might prefer to throw an
                  // exception here, instead of recovering by appending incoming
                  // onto the existing array.
                  merged.push.apply(merged, incoming);
                }
                return merged;
              },
              read(existing, { args }) {
                if (!existing) return;
                if (args) {
                  const { skip = 0, take } = args;
                  // A read function should always return undefined if existing is
                  // undefined. Returning undefined signals that the field is
                  // missing from the cache, which instructs Apollo Client to
                  // fetch its value from your GraphQL server.
                  const subList = [];
                  let i = 0;
                  for (i = 0; i < take; ++i) {
                    const item = existing[skip + i];
                    if (!item) break;
                    subList.push(item);
                  }
                  if (i === 1 && skip === 0) return subList;
                  if (i < take - 1) return; //存在empty, 重新获取
                  return subList;
                } else {
                  return existing;
                }
              },
            },
          },
        },
      },
    }),
    connectToDevTools: true,
  });
