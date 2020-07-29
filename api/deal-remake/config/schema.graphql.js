const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  definition: `
    type DealRemakePayload {
      deals: [DealRemake],
      nextCursor: String,
      prevCursor: String,
      hasMore: Boolean
    }
  `,
  mutation: `
     baseCreateDealRemake(title: String, dealData: JSON, author: String, approved: Boolean): DealRemake
  `,
  query: `
    dealFilter(where: JSON, sort: String, limit: Int, cursor: String ): DealRemakePayload
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
          let cursor = query._cursor || "";
          let hasMore = true;
          const sort = query._sort;
          // removing these so that the query doesn't use them, instead they'll be used in custom ways
          delete query._limit;
          delete query._sort;
          delete query._cursor;
          const queryToArray = Object.keys(query);
          queryToArray.forEach((item, i) => {
            if (item.includes("Approved")) {
              // if approved was passed it has a different format
              query[item.split(".")[0].toLowerCase()] = query[item];
              delete query[item];
              return;
            }
            if (Array.isArray(query[item])) {
              query[item] = { $in: query[item] };
            }
          });
          // console.log('query', query)
          const sortDesc = sort.charAt(0) === "-";
          const whereDisplay = cursor
            ? "_id"
            : sortDesc
            ? sort.substr(1)
            : sort;
          const handleOrder = () => {
            if (!cursor) {
              return;
            } else {
              if (sortDesc) {
                return "lt";
              }
              return "gt";
            }
          };
          let deals;
          if (!cursor) {
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
              [handleOrder()](cursor)
              .limit(Number(limit));
          }
          nextCursor = (deals.length && deals[deals.length - 1]._id) || "";
          prevCursor = (deals.length && deals[0]._id) || "";
          if (deals.length < limit) {
            hasMore = false;
            nextCursor = "";
          }
          return { deals, prevCursor, nextCursor, hasMore };
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
          // console.log('context', context.request.header)
          // return;
          return await strapi.services["deal-remake"].baseCreateDealRemake(
            dealData,
            title,
            approved,
            author
          );
        },
      },
    },
  },
};
