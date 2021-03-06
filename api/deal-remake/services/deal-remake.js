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

const handleDeal = async (dealData) => {
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
  const filters = await strapi.query("filter").find({});
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
        const reprinted = `${splitup.join(" ")}`;
        ranking = isRanking(reprinted);
        if (ranking) {
          // console.log("ranking1", ranking, dealData[x]);
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
          // console.log("ranking1", ranking, dealData[x]);
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
};

module.exports = {
  baseCreateDealRemake: async (dealData, title, approved, author) => {
    if (!dealData) return
    const getUser = await strapi
      .query("user", "users-permissions")
      .findOne({ _id: author });
    // if submitted deal wasn't from administrator then set the approved value to false.
    if (!getUser || !author) {
      approved = false;
    } else {
      if (!getUser.role.name === "Administrator") {
        approved = false;
      } else if (getUser.role.name === "Administrator") {
        approved = true;
      } else {
        approved = false;
      }
    }
    // console.log("dealData", dealData);
    let comments = (dealData.Comments && dealData.Comments.value) || "";
    deal = await strapi.query("deal-remake").create({
      title,
      comments,
      approved,
      author,
      Documents: {
        item: {
          value: (dealData.Documents && dealData.Documents.value) || [],
        },
      },
      Size: {
        item: {
          value: (dealData.Size && dealData.Size.value) || 0,
          status: (dealData.Size && dealData.Size.status) || null,
          id: null,
        },
      },
      Size_EUR: {
        item: {
          value: (dealData.Size_EUR && dealData.Size_EUR.value) || 0,
          status: (dealData.Size_EUR && dealData.Size_EUR.status) || null,
          id: null,
        },
      },
      Year: {
        item: {
          value:
            (dealData.Year && dealData.Year.value) ||
            `20${dealData.Month.value.split(" ")[1]}` ||
            null,
          status: (dealData.Year && dealData.Year.status) || null,
          id: null,
        },
      },
      Month: {
        item: {
          value: (dealData.Month && dealData.Month.value) || null,
          status: (dealData.Month && dealData.Month.status) || null,
          id: null,
        },
      },
      Is_EBITDA_above_10m: {
        item: {
          value: (dealData.Is_EBITDA_above_10m && dealData.Is_EBITDA_above_10m.value) || null,
          status:
            (dealData.Is_EBITDA_above_10m && dealData.Is_EBITDA_above_10m.status) ||
            null,
          id: null,
        },
      },
      // Is_EBITDA_above_10m: {
      //   item: {
      //     value: dealData.EBITDA && dealData.EBITDA.value > 10 ? "Yes" : "No",
      //     status: null,
      //     id: null,
      //   },
      // },
    });
    if (
      !deal.Year ||
      !deal.Month ||
      !deal.Year.item.value ||
      !deal.Month.item.value
    ) {
      await strapi.query("deal-remake").delete({ id: deal.id });
      console.log("deal deleted", deal.id);
      return;
    }
    await handleDeal(dealData);
    return deal;
  },
  approvedDealRemake: async (dealData) => {
    // console.log('dealData', dealData)
    if (dealData && dealData.approved) {
      deal = dealData;
      await handleDeal(dealData);
      return deal;
    }
  },
  baseUpdateDealRemake: async (dealData, title, id) => {
    deal = dealData;
    deal.id = id ? id : dealData.id;
    deal.approved = JSON.parse(dealData.approved.value);
    deal.comments =
      deal.Comments && deal.Comments.value ? deal.Comments.value : "";
    console.log("deal.comments", deal);
    if (deal) {
      await strapi.query("deal-remake").update(
        { id },
        {
          Size: {
            item: {
              value: (deal.Size && deal.Size.value) || 0,
              status: (deal.Size && deal.Size.status) || null,
              id: null,
            },
          },
          Size_EUR: {
            item: {
              value: (deal.Size_EUR && deal.Size_EUR.value) || 0,
              status: (deal.Size_EUR && deal.Size_EUR.status) || null,
              id: null,
            },
          },
          Is_EBITDA_above_10m: {
            item: {
              value: (deal.Is_EBITDA_above_10m && deal.Is_EBITDA_above_10m.value) || null,
              status: (deal.Is_EBITDA_above_10m && deal.Is_EBITDA_above_10m.status) || null,
              id: null,
            },
          },
          approved: deal.approved,
          title,
          comments: deal.comments,
        }
      );

      handleDeal(deal);
      return deal;
    }
  },
};
