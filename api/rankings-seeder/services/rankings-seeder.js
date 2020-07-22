"use strict";

/**
 * `rankings-seeder` service.
 */

const items = [
  {
    name: "Lender",
  },
  {
    name: "Debt advisor",
  },
  {
    name: "Sponsor",
  },
  {
    name: "Sponsor counsel",
  },
  {
    name: "Lender counsel",
  },
];
module.exports = {
  // exampleService: (arg1, arg2) => {
  //   return isUserOnline(arg1, arg2);
  // }
  seed: async () => {
    let hasCreated = [];
    items.forEach(async ({name}) => {
      const created = await strapi.query('ranking').create({
        name
      })
      hasCreated.push(created)
    });
    console.log('created:', hasCreated.map(item => item.name))
  },
};
