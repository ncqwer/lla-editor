module.exports = {
  client: {
    includes: ['./packages/example/src/components/gql/**/*.ts'],
    service: {
      name: 'lla-comment',
      // url: 'http://yinglian.zhaji.wiki/graphql',
      url: 'http://localhost:7001/graphql',
      // url: 'yinglian.zhaji.wiki/graphql',
    },
  },
};
