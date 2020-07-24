'use strict';

/**
 * `clear-data-seeder` service.
 */

module.exports = {
  // exampleService: (arg1, arg2) => {
  //   return isUserOnline(arg1, arg2);
  // }
  seed: async () => {
    await strapi.query('deal-remake').model.deleteMany({});
    await strapi.query('filter-item').model.deleteMany({})
    await strapi.query('ranking-item').model.deleteMany({})
  }
};
