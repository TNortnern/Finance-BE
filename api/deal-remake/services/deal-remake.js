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
    const getUser = await strapi
      .query("user", "users-permissions")
      .findOne({ id: author });
    // console.log('getUser', getUser)
    // if submitted deal wasn't from administrator then set the approved value to false.
    if (!getUser || !author) {
      approved = false;
    } else {
      if (!getUser.role.name === "Administrator") {
        approved = false;
      }
    }
    // console.log("dealData", dealData);
    const filters = await strapi.query("filter").find({});
    let comments = (dealData.Comments && dealData.Comments.value) || "";
    deal = await strapi.query("deal-remake").create({
      title,
      comments,
      approved,
      author,
      Size: {
        item: {
          value: (dealData.Size && dealData.Size.value) || 0,
          status: (dealData.Size && dealData.Size.status) || null,
          id: null,
        },
      },
      Year: {
        item: {
          value:
            (dealData.Year && dealData.Year.value) ||
            `20${dealData.Month.split(" ")[1]}` ||
            null,
          status: (dealData.Year && dealData.Year.status) || null,
          id: null,
        },
      },
      Is_EBITDA_above_10m: {
        item: {
          value: dealData.EBITDA && dealData.EBITDA.value > 10 ? "Yes" : "No",
          status: null,
          id: null,
        },
      },
    });
    if (!deal.Year.item.value) {
      await strapi.query("deal-remake").delete({ id: deal.id });
      console.log('deal deleted', deal.id)
      return;
    }
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
            console.log("ranking1", ranking, dealData[x]);
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
            console.log("ranking1", ranking, dealData[x]);
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
            if (filter) {
              resolveFilter(filter, x, current);
            }
          }
        }
      }
    }
    return deal;
  },
};
