const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  definition: `
  extend type RankingItem {
  items: [Deal]
  dealCount: Int
 
}
  `,
  query: `
      filterListItemsSort(sort: String, limit: Int, start: Int, where: JSON): [FilterListItem]
  `,
  type: {
    // FilterListItemSortable: {},
  },
  resolver: {
    Query: {
      // await strapi.services.deal.search(ctx.query)
      filterListItemsSort: {
        resolverOf: "application::ranking-item.ranking-item.find",
        resolver: async (parent, opt, {context}) => {
          console.log("options", opt);
          console.log("ctxs", context.query);
          // console.log('parent', parent)
          // console.log('strapi.controllers', strapi.controllers['ranking-item'])
          // const items = await strapi.controllers['ranking-item'].find(ctx.context);
          const items = await strapi.services["ranking-item"].find(context.query);
          // console.log("items", items);
              return items.map((entity) =>
                sanitizeEntity(entity, { model: strapi.models['ranking-item'] })
              );

        },
      },
    },
     RankingItem: {
      dealCount: {
        resolverOf: "application::ranking-item.ranking-item.find",
        resolver: async (parent, options, ctx) => {
          // console.log("parent", parent.deals.length);
          // console.log('parent', parent)
          const items = await strapi.controllers["ranking-item"].find(
            ctx.context
          );
          // console.log("items", items);

          return parent.deals.length;
        },
      },
      items: {
        resolverOf: "application::ranking-item.ranking-item.find",
        resolver: async (parent, opt, ctx) => {
          console.log("options", opt);
          console.log("ctxs", ctx.context.params);
          // console.log('parent', parent)
          // console.log('strapi.controllers', strapi.controllers['ranking-item'])
          // const items = await strapi.controllers['ranking-item'].find(ctx.context);
          const items = await strapi.controllers["ranking-item"].sortByDealCount(
            ctx.context.params
          );
          return items;
        },
      },
    },
  },
};
