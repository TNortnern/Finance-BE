const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  rankCount: async (ctx) => {
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
          if (foundRank && foundRank.name === "Lawyer") {
            return rank;
          }
        });
      }
      rankings = await strapi.query("ranking-item").find({});
      for (const ranking of rankings) {
        for (const deal of ranking.deals) {
          filters = await strapi.query("filter-list-item").find({
            deal: deal._id,
          });

        }
      }
    }
    return deals;
  },
  sortByDealCount: async (ctx) => {
    let deals;
    let rankings;
    let filters;
    let arr;
    let allRanks = await strapi.query('ranking').find({})

    let ranks = await strapi
      .query("ranking-item")
      .search({ "ranking.name": 'test' })
      deals = await strapi.query('deal').model.find({})
    return deals;
  },
};
