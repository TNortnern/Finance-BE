const { sanitizeEntity } = require("strapi-utils");
let deal;
let ctx;
const capitalize = (item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
};
const resolveFilter = async (filter, key, value) => {
  return await strapi.controllers["deal-remake"].filterHandler(filter, key, value, deal);
};
const resolveRanking = async (ranking, key, value) => {
  // console.log('value', ranking)
  let ranking_item = await strapi.query("ranking-item").findOne({ value });
  let resolvedValue = ranking_item ? ranking_item.value : "";
  let resolvedId = ranking_item ? ranking_item.id : "";
  let matcher;
  if (ranking_item) {
    if (key.includes("_")) {
      let temp = key.split("_")[0] + " " + key.split("_")[1];
      matcher = temp.toLowerCase() === ranking_item.ranking.name.toLowerCase();
    } else {
      matcher = key.toLowerCase() === ranking_item.ranking.name.toLowerCase();
    }
  }
  if (!matcher) {
    console.log("matcher did not work worked");
    ranking_item = await strapi.query("ranking-item").create({
      ranking: ranking.id,
      value,
      deal: deal.id,
      size_total: deal.Size.item.value,
      dealAmount: 1,
      deal_remakes: [deal.id],
    });
    resolvedValue = ranking_item.value;
    resolvedId = ranking_item.id;
  } else {
    await strapi.query("ranking-item").update(
      { id: ranking_item.id },
      {
        size_total: ranking_item.size_total + Number(deal.Size.item.value),
        dealAmount: ranking_item.dealAmount + 1,
      }
    );
  }
  return await strapi.query("deal-remake").update(
    { id: deal.id },
    {
      [capitalize(key)]: {
        item: {
          value: resolvedValue || value,
          status: null,
          id: resolvedId,
          isRanking: true,
        },
      },
    }
  );
};

module.exports = {
  mutation: `
     baseCreateDealRemake(title: String, dealData: JSON, author: String, approved: Boolean): Deal
  `,
  query: `
    dealFilter(where: JSON, sort: String, limit: Int, cursor: String): [DealRemake]
  `,
  resolver: {
    Query: {
      dealFilter: {
        resolverOf: "application::deal-remake.deal-remake.sorter",
        resolver: async (parent, data, { context }) => {
          const { query } = context;
          delete query._limit;
          const deals = await strapi.query("deal-remake").model.find(query);
          return deals;
        },
      },
    },
    Mutation: {
      baseCreateDealRemake: {
        resolverOf: "application::deal-remake.deal-remake.create",
        resolver: async (
          parent,
          { dealData, title, approved, author },
          { context }
        ) => {
          // const result = await strapi.query("filter-item").model.find().distinct('value');
          ctx = context;
          const filters = await strapi.query("filter").find({});
          let comments = dealData.comments;
          deal = await strapi.query("deal-remake").create({
            title,
            comments,
            approved,
            author,
            Size: { item: { value: dealData.size, status: null, id: null } },
          });
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
          const isRanking = (item) =>
            rankings.find((rank) => rank.name === item);
          for (let x in dealData) {
            let filter = null;
            let ranking = null;
            let cur = dealData[x];
            x = capitalize(x);
            // size and comments already have been extracted so just ignore those fields
            if (x !== "Comments" && x !== "Size") {
              let value = cur;
              if (typeof cur === "object" && !Array.isArray(cur) && cur !== null) {
                value = cur.value;
              }
              if (x.includes("_")) {
                const splitup = x.split("_");
                const reprinted = `${splitup[0]} ${splitup[1]}`;
                ranking = isRanking(reprinted);
                if (ranking) {
                  console.log("x", value);
                  resolveRanking(ranking, x, value);
                  //
                } else {
                  filter = filters.find((filt) => filt.name === reprinted);
                  if (filter) {
                    resolveFilter(filter, x, value);
                  }
                }
              } else {
                ranking = isRanking(x);
                if (ranking) {
                  resolveRanking(ranking, x, value);
                } else {
                  let specialCase = "";
                  if (x === "Above10") {
                    specialCase = "Is EBITDA above 10m?";
                  }
                  if (specialCase) {
                    filter = filters.find(
                      (filt) =>
                        filt.name.toLowerCase() === specialCase.toLowerCase()
                    );
                  } else {
                    filter = filters.find(
                      (filt) => filt.name.toLowerCase() === x.toLowerCase()
                    );
                  }
                  // we used a special name for this on the frontend so we need to convert so that the filter can be found properly
                  if (x === "Above10") x = "Is_EBITDA_above_10m";
                  resolveFilter(filter, x, value);
                }
              }
            }
          }
          return deal;
        },
      },
    },
  },
};
