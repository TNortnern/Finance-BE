"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    // Called before an entry is created
    // async beforeCreate(data) {
    //   if (data.deals && data.deals.length) {
    //     let sizeTotal = 0;
    //     data.dealAmount = data.deals.length;
    //     const allDeals = await strapi.query("deal").find({ id_in: data.deals });
    //     for await (const deal of allDeals) {
    //       sizeTotal += deal.size;
    //     }
    //     data.size_total = sizeTotal;
    //   }
    // },
    // // Called after an entry is created
    // async beforeUpdate(params, data) {
    //   if (data.deals && data.deals.length) {
    //     let sizeTotal = 0;
    //     data.dealAmount = data.deals.length;
    //     const allDeals = await strapi.query("deal").find({ id_in: data.deals });
    //     for await (const deal of allDeals) {
    //       sizeTotal += deal.size;
    //     }
    //     data.size_total = sizeTotal;
    //   }
    // },
    async beforeDelete(params) {
      const ranking = await strapi.query("ranking-item").findOne({ id: params._id });
      const entries = await strapi
        .query("deal-entry")
        .find({ ranking_item: ranking.id });
      for await (const entry of entries) {
        await strapi.query("deal-entry").delete({
          id: entry.id,
        });
      }
    },
  },
};
