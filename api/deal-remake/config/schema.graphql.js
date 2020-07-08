const { sanitizeEntity } = require("strapi-utils");
let deal;
let ctx;
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
  definition: `
    type DealRemakePayload {
      deals: [DealRemake],
      frontCursor: String,
      backCursor: String,
      hasMore: Boolean
    }
  `,
  mutation: `
     baseCreateDealRemake(title: String, dealData: JSON, author: String, approved: Boolean): Deal
  `,
  query: `
    dealFilter(where: JSON, sort: String, limit: Int, frontCursor: String, backCursor: String ): DealRemakePayload
  `,
  resolver: {
    Query: {
      // DealRemakePayload: {

      // },
      dealFilter: {
        resolverOf: "application::deal-remake.deal-remake.sorter",
        resolver: async (parent, data, { context }) => {
          const { query } = context;
          const limit = query._limit;
          let hasMore = true;
          const sort = query._sort;
          let frontCursor = query._frontCursor || "";
          let backCursor = query._backCursor || "";
          delete query._limit;
          delete query._sort;
          delete query._frontCursor;
          delete query._backCursor;
          console.log("query", query);
          console.log("context", limit, sort);
          // query.title = {
          //   "title": { $gt: "mycompany (Jan 19 sponsor DealType2): mytrance" },
          // };
          // console.log('title', query.title)
          // if (cursor.)
          const sortDesc = sort.charAt(0) === "-";
          const whereDisplay =
            backCursor || frontCursor
              ? "_id"
              : sortDesc
              ? sort.substr(1)
              : sort;
          const handleOrder = () => {
            if (!frontCursor && !backCursor) {
              return
            } else if(backCursor) {
              return 'gt'
            } else {
              return 'lt';
            }
          };
          const handleCursor = () => {
            if (frontCursor) {
              return frontCursor;
            } else {
              return backCursor;
            }
          };
          let deals;
          if (!frontCursor && !backCursor) {
            deals = await strapi
              .query("deal-remake")
              .model.find(query)
              .sort(sort)
              .limit(Number(limit));
          } else {
            deals = await strapi
              .query("deal-remake")
              .model.find(query)
              .sort(sort)
              .where(whereDisplay)
              [handleOrder()](handleCursor())
              .limit(Number(limit));
          }
          // const count = await strapi.query('deal-remake').count({})
          backCursor = deals[deals.length - 1]._id || "";
          frontCursor = frontCursor || "";
          if (deals.length < limit) {
            hasMore = false;
            backCursor = ""
          }
          return { deals, frontCursor, backCursor, hasMore };
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
              if (
                typeof cur === "object" &&
                !Array.isArray(cur) &&
                cur !== null
              ) {
                value = cur.value;
              }
              if (x.includes("_")) {
                const splitup = x.split("_");
                const reprinted = `${splitup[0]} ${splitup[1]}`;
                ranking = isRanking(reprinted);
                if (ranking) {
                  console.log("x", ranking);
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
