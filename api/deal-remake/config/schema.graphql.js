const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  definition: `
    type DealRemakePayload {
      deals: [DealRemake],
      hasMore: Boolean,
      total: Int,
      totalPages: Int
    }
  `,
  mutation: `
     baseCreateDealRemake(title: String, dealData: JSON, author: String, approved: Boolean): DealRemake,
     baseUpdateDealRemake(title: String, dealData: JSON, id: ID): DealRemake

  `,
  query: `
    dealFilter(where: JSON, sort: String, limit: Int, page: Int ): DealRemakePayload
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
          const page = query._page - 1;
          let hasMore = true;
          const sort = query._sort ? query._sort : "-Month.item.value";
          // removing these so that the query doesn't use them, instead they'll be used in custom ways
          delete query._limit;
          delete query._sort;
          delete query._page;
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
          const deals = await strapi
            .query("deal-remake")
            .model.find(query)
            .sort(sort)
            .skip(page * Number(limit))
            .limit(Number(limit));
          const total = await strapi
            .query("deal-remake")
            .model.countDocuments(query);
          const totalPages = Math.ceil(total / limit);
          if (page + 1 !== totalPages) {
            hasMore = true;
          } else {
            hasMore = false;
          }
          return { deals, hasMore, total, totalPages };
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
          return await strapi.services["deal-remake"].baseCreateDealRemake(
            dealData,
            title,
            approved,
            author
          );
        },
      },
      baseUpdateDealRemake: {
        resolverOf: "application::deal-remake.deal-remake.update",
        resolver: async (parent, { dealData, title, id }, { context }) => {
          return await strapi.services["deal-remake"].baseUpdateDealRemake(
            dealData,
            title,
            id
          );
        },
      },
    },
  },
};
