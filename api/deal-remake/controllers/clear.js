"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  clearAll(ctx) {
    if (ctx.request.body.author === process.env.ADMIN) {
      strapi.services["clear-data-seeder"].seed();
      ctx.send("success");
    } else {
      ctx.throw("Unauthorized");
    }
  },
};
