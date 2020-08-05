/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async afterUpdate(result, params, data) {
      const user = await strapi
        .query("user", "users-permissions")
        .findOne({ id: params._id });
      if (data.approved && data.views_left === 0) {
        const defaults = await strapi.query("defaults").findOne({});
        console.log("defaults", defaults);
        await strapi
          .query("user", "users-permissions")
          .update({ id: params._id }, { views_left: defaults.view_count });
      }
    },
  },
};
