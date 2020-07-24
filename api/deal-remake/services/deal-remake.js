"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */
let deal;
const capitalize = (item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
};
const resolveFilter = async (filter, key, value) => {
  return await strapi.controllers["deal-remake"].filterHandler(
    filter,
    key,
    value,
    deal
  );
};
const resolveRanking = async (ranking, key, value) => {
  await strapi.controllers["deal-remake"].rankingHandler(
    ranking,
    key,
    value,
    deal
  );
};

module.exports = {
  baseCreateDealRemake: async (dealData, title, approved, author) => {
      // console.log('dealData', dealData)
    const filters = await strapi.query("filter").find({});
    let comments = dealData.Comments.value;
    deal = await strapi.query("deal-remake").create({
      title,
      comments,
      approved,
      author,
      Size: {
        item: {
          value: dealData.Size.value,
          status: dealData.Size.status,
          id: null,
        },
      },
      Is_EBITDA_above_10m: {
        item: {
          value: dealData.EBITDA.value > 10 ? "Yes" : "No",
          status: null,
          id: null,
        },
      },
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
    const isRanking = (item) => rankings.find((rank) => rank.name === item);
    for (let x in dealData) {
      let filter = null;
      let ranking = null;
      let current = dealData[x];
      x = capitalize(x);
      // size and comments already have been extracted so just ignore those fields
      if (x !== "Comments" && x !== "Size") {
        // check if the object key contains a underscore, if so we need to handle these differently to find filters/rankings
        if (x.includes("_")) {
          const splitup = x.split("_");
          const reprinted = `${splitup[0]} ${splitup[1]}`;
          ranking = isRanking(reprinted);
          if (ranking) {
            resolveRanking(ranking, x, current);
          } else {
            filter = filters.find((filt) => filt.name === reprinted);
            if (filter) {
              resolveFilter(filter, x, current);
            }
          }
        } else {
          ranking = isRanking(x);
          if (ranking) {
            resolveRanking(ranking, x, current);
          } else {
            let specialCase = "";
            if (specialCase) {
              filter = filters.find(
                (filt) => filt.name.toLowerCase() === specialCase.toLowerCase()
              );
            } else {
              filter = filters.find(
                (filt) => filt.name.toLowerCase() === x.toLowerCase()
              );
            }
            // we used a special name for this on the frontend so we need to convert so that the filter can be found properly
            resolveFilter(filter, x, current);
          }
        }
      }
    }
    return deal;
  },
};
