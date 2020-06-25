const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  rankCount: async (ctx) => {
    console.log("ctx.query", ctx);
    let deals;
    let rankings;
    let filters;
    let arr;
    if (ctx.query._q) {
      deals = await strapi.services.deal.search(ctx.query);
    } else {
      deals = await strapi.services.deal.find(ctx.query);
      for await (const deal of deals) {
        let toSum = [];
        let toCount = [];
        deal.rankings.filter(async (rank) => {
          const foundRank = await strapi
            .query("ranking")
            .findOne({ _id: rank.ranking });
          // console.log('isLawyer', isLawyer)
          if (foundRank && foundRank.name === "Lawyer") {
            console.log("rank", rank);

            return rank;
          }
        });
      }
      rankings = await strapi.query("ranking-item").find({});
      for (const ranking of rankings) {
        // console.log('ranking', ranking.deals)
        for (const deal of ranking.deals) {
          // console.log('deal', deal)
          filters = await strapi.query("filter-list-item").find({
            deal: deal._id,
          });
          // console.log('filters', filters)
          //    arr = filters.filter(filt => filt.filter.name === 'Price')
          //    console.log('afilt', afilt)
          // for (const filt of filters){
          //     arr = [...arr, filt]
          // }
          // console.log('filters', filters.filter)
        }
      }
    }
    return deals;
  },
  sortByDealCount: async (ctx) => {
    // console.log("ctx.query", ctx.query);
    // console.log('ctx', ctx)
    let deals;
    let rankings;
    let filters;
    let arr;
    let allRanks = await strapi.query('ranking').find({})
    // console.log('allRanks', allRanks[0].items)
    // const IdArray =
    let ranks = await strapi
      .query("ranking-item")
      .search({ "ranking.name": 'test' })
      console.log('lawyers', ranks)
      deals = await strapi.query('deal').model.find({})
    // console.log('sot', deals)
    return deals;
  },
//   findOne: async (ctx) => {
//     console.log("ctx.query", ctx);
//     let deals;
//     let rankings;
//     let filters;
//     let arr;
//     if (ctx.query._q) {
//       deals = await strapi.services.deal.search(ctx.query);
//     } else {
//     }
//     deals = await strapi.query("ranking-item").find({});
//     // console.log('deals', deals)
//     return deals[0];
//   },
};
