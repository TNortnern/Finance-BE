const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  mutation: `
     bulkCreateRankings(ranking: String, value: String): [RankingItem]
  `,
  resolver: {
    Mutation: {
      // await strapi.services.deal.search(ctx.query)
      bulkCreateRankings: {
        resolverOf: "application::ranking-item.ranking-item.create",
        resolver: async (parent, {ranking, value}, {context}) => {
          // console.log('opt', opt)
          const rank = await strapi.query('ranking').findOne({ name: ranking })
          console.log('heyt')
          console.log('rank', rank.id)
        },
      },
    },
  },
};
