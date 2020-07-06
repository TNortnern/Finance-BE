'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async sorter(ctx) {
    //   console.log('ctx', ctx)
   const deals = await strapi.query("deal-remake").find()
   console.log('deals', deals)
   return deals
  },
};
