"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    // Called before an entry is created
    async beforeCreate(data) {
      let deal = null;
      if (data.deal !== undefined) {
        deal = await strapi.query("deal").findOne({ id: data.deal });
      } else {
        return;
      }
      // findOne will find the first deal no matter what if there isn't match, so if the found deal doesn't match the passed deal, then discontinue logic
      if (deal.id !== data.deal || !deal) {
        return;
      }
      const dealEntries = await strapi
        .query("deal-entry")
        .find({ deal: deal.id });
      let ranking;
      // check to see if the filter item already exists for this deal
      if (data.filter_item) {
        const existingFilter = dealEntries.find(
          (d) => d.filter_item == data.filter_item
        );
        if (existingFilter)
          throw new Error("That filter item already exists on this deal.");
      }
      if (data.ranking_item) {
        ranking = await strapi
          .query("ranking-item")
          .findOne({ id: data.ranking_item });
        const existingRanking = dealEntries.find(
          (d) => d.ranking_item == data.ranking_item
        );
        if (existingRanking)
          throw new Error("That ranking item already exists on this deal.");
        // get all the deals for the rank
        const rankEntryItems = await strapi
          .query("deal-entry")
          .find({ ranking_item: ranking.id });
        let sizeTotal = deal.size;
        // sum the deals if the rank has some
        if (rankEntryItems.length) {
          const allDeals = rankEntryItems.map((rank) => rank.deal);
          for await (const curDeal of allDeals) {
            sizeTotal += curDeal.size;
          }
          await strapi.query("ranking-item").update(
            { id: ranking.id },
            {
              dealAmount: rankEntryItems.length + 1,
              size_total: sizeTotal,
            }
          );
        } else {
          // this is the rankings first deal
          await strapi
            .query("ranking-item")
            .update(
              { id: ranking.id },
              { dealAmount: 1, size_total: sizeTotal }
            );
        }
      }
    },
    async beforeDelete(params, data) {
      const entry = await strapi
        .query("deal-entry")
        .findOne({ id: params._id });
      if (entry.ranking_item) {
        if (!entry.deal) {
          return;
        }
        await strapi.query("ranking-item").update(
          { id: entry.ranking_item.id },
          {
            dealAmount: entry.ranking_item.dealAmount - 1,
            size_total: entry.ranking_item.size_total - entry.deal.size,
          }
        );
      }
    },
  },
};
