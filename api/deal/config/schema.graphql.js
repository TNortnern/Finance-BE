const { sanitizeEntity } = require("strapi-utils");
let deal;
const capitalize = (item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
};
const createEntryFilter = async (filter, value) => {
  let filter_item = await strapi.query("filter-item").findOne({ value });
  if (!filter_item || filter_item.filter.name.toLowerCase() !== filter.name.toLowerCase()) {
    filter_item = await strapi.query("filter-item").create({
      filter,
      value,
      deal: deal.id,
    });
  }
  return await strapi.query("deal-entry").create({
    filter_item,
    deal: deal.id,
  });
};
const createEntryRanking = async (ranking, value) => {
  let ranking_item = await strapi.query("ranking-item").findOne({ value });
  if (!ranking_item) {
    ranking_item = await strapi.query("ranking-item").create({
      ranking,
      value,
      deal: deal.id,
    });
  }
  return await strapi.query("deal-entry").create({
    ranking_item,
    deal: deal.id,
  });
};

module.exports = {
  mutation: `
     baseCreateDeal(title: String, dealData: JSON, author: String, approved: Boolean): Deal
  `,
  resolver: {
    Mutation: {
      baseCreateDeal: {
        resolverOf: "application::deal.deal.create",
        resolver: async (
          parent,
          { dealData, title, approved, author },
          { context }
        ) => {
          // const result = await strapi.query("filter-item").model.find().distinct('value');
          let size = dealData.size;
          let comments = dealData.comments;
          deal = await strapi.query("deal").create({
            title,
            size,
            comments,
            approved,
            author,
          });
          const rankings = [
            {
              id: "5ef2099480bf93656c8fdd06",
              name: "Lawyer",
            },
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
          const filters = await strapi.query("filter").find({});
          const isRanking = (item) =>
            rankings.find((rank) => rank.name === item);
          let rankIds = [];
          let filterIds = [];
          for (let x in dealData) {
            let cur = dealData[x];
            x = capitalize(x);
            let filter = null;
            let ranking = null;
            // size and comments already have been extracted so just ignore those fields
            if (x !== "Size" && x !== "Comments") {
              let value = cur;
              if (typeof cur === "object") {
                value = cur.value;
              }
              if (x.includes("_")) {
                const splitup = x.split("_");
                const reprinted = `${splitup[0]} ${splitup[1]}`;
                ranking = isRanking(reprinted);
                if (ranking) {
                  createEntryRanking(ranking.id, value);
                  //
                } else {
                  filter = filters.find((filt) => filt.name === reprinted);
                  if (filter && filter) {
                    createEntryFilter(filter, value);
                  } else {
                  }
                }
              } else {
                ranking = isRanking(x);
                if (ranking) {
                  createEntryRanking(ranking.id, value);
                } else {
                  // we used a special name for this on the frontend so we need to convert so that the filter can be found properly
                  if (x === "Above10") x = "Is EBITDA above 10m?";
                  filter = filters.find(
                    (filt) => filt.name.toLowerCase() === x.toLowerCase()
                  );
                  if (filter && filter) {
                    createEntryFilter(filter, value);
                  } else {
                  }
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
