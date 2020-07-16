const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  definition: `
  extend type RankingItem {
    total_count: Int
    total_amount: Int
  }
  `,
  query: `
    rankingsSort(whereRankings: JSON, whereDeals: JSON, sort: String, limit: Int): [RankingItem],
  `,
  resolver: {

    Query: {
      rankingsSort: {
        resolverOf: "application::ranking-item.ranking-item.find",
        resolver: async (parent, data, { context }) => {
          // console.log('context', context.query)
          // console.log('context.state', context.state)
          function flatten(value, path = []) {
            if (value != null && typeof value === "object") {
              return Object.entries(value).reduce(
                (previous, [key, val]) => ({
                  ...previous,
                  ...flatten(val, [...path, key]),
                }),
                {}
              );
            }

            return { [path.join(".")]: value };
          }
          console.log('flatten', flatten(context.query._whereDeals))
          // const arank = await strapi.query('deal-remake').model.find({ "Deal_type.item.value": "dea" })
          // console.log('object', arank)
          // console.log('items', await strapi.query('ranking-item').find( {"ranking.name": "Lender" } ))
          // console.log('object', arank.map(ar => ar.id))
          console.log('context.query_limit ', context.query._limit )
          const rankQuery = flatten(context.query._whereRankings)
          const lookup = await strapi.query("ranking-item").model.aggregate([
            {
              $lookup: {
                from: "rankings",
                localField: "ranking",
                foreignField: "_id",
                as: "ranking",
              },
            },
            { $match: { ...flatten(context.query._whereRankings) } },
            { $unwind: "$ranking" },
            {
              $lookup: {
                from: "deal_remakes",
                localField: "deal_remakes",
                foreignField: "_id",
                as: "deal_remakes",
              },
            },
            { $unwind: "$deal_remakes" },
            { $match: flatten(context.query._whereDeals) },
            {
              $group: {
                _id: "$value",
                value: { $first: '$value'},
                ranking: { $first: '$ranking' },
                total_amount: {
                  $sum: { $toInt: "$deal_remakes.Size.item.value" },
                },
                total_count: { $sum: 1 },
              },
            },
            {
              $sort: { [context.query._sort]: -1 },
            },
            {
              $limit: Number(context.query._limit) || 10
            }
            // { $replaceRoot: { newRoot: "$doc" } },

            //  {
            //    $project: {
            //      test: "$$ROOT"
            //    }
            //  }
          ]);
          console.log("lookup", lookup);
          return lookup;
        },
      },
    },
    // Mutation: {
    //   // await strapi.services.deal.search(ctx.query)
    //   bulkCreateRankings: {
    //     resolverOf: "application::ranking-item.ranking-item.create",
    //     resolver: async (parent, {ranking, value}, {context}) => {
    //       const rank = await strapi.query('ranking').findOne({ name: ranking })

    //     },
    //   },
    // },
  },
};
