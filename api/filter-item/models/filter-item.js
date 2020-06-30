"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeDelete(params) {
      const deal = await strapi
        .query("filter-item")
        .findOne({ id: params._id });
      const entries = await strapi
        .query("deal-entry")
        .find({ filter_item: params._id });
      for await (const entry of entries) {
        await strapi.query("deal-entry").delete({
          id: entry.id,
        });
      }
    },
  },
};
