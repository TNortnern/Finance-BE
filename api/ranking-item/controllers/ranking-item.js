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
    let allRanks = await strapi.query("ranking").find({});

    let ranks = await strapi
      .query("ranking-item")
      .search({ "ranking.name": "test" });
    deals = await strapi.query("deal").model.find({});
    return deals;
  },
  customFind: async (ctx) => {
    return await strapi.query.find({});
  },
  storeDeals: async () => {
    const rankings = [
      {
        id: "5ef782a0eaa67c240465a46d",
        name: "Lender",
      },
      {
        id: "5ef782a8eaa67c240465a46e",
        name: "Debt advisor",
      },
      {
        id: "5ef782aceaa67c240465a46f",
        name: "Sponsor",
      },
      {
        id: "5ef782b4eaa67c240465a470",
        name: "Sponsor counsel",
      },
      {
        id: "5ef783a9eaa67c240465a471",
        name: "Lender counsel",
      },
    ];
    const rankingItems = await strapi.query("deal-remake").find({});
    for await (const rankingItem of rankingItems) {
      for (const rank in rankings) {
        const cur = rankingItem[rank.name.includes(' ') ? rank.name.split(' ').join('_') : rank.name]
        await strapi.query("ranking-item").update(
          { id: cur.id },
          {
            item: [
              {
                item: {
                  value: "sponsortest",
                  status: null,
                  id: "5f0cfaaea6027974886a8f77",
                },
              },
              {
                item: {
                  value: "sponsortest",
                  status: null,
                  id: "5f0cfaaea6027974886a8f77",
                },
              },
            ],
          }
        );
        console.log('cur', cur)
      }
    }
  },
};
