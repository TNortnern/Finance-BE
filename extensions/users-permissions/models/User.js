/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async afterUpdate(result, params, data) {
      const axios = require("axios");
      const user = await strapi
        .query("user", "users-permissions")
        .findOne({ id: params._id });
      if (data.approved) {
        if (data.views_left === 0) {
          const defaults = await strapi.query("defaults").findOne({});

          console.log("defaults", defaults);
          await strapi
            .query("user", "users-permissions")
            .update({ id: params._id }, { views_left: defaults.view_count });
        }
        if (!data.confirmed) {
          await axios
            .post(
              `https://finance-strapi-cms.herokuapp.com/auth/send-email-confirmation`,
              {
                email: user.email, // user's email
              }
            )
            .then((response) => {
              console.log("Your user received an email");
            })
            .catch((error) => {
              console.error("An error occurred:", error.response.data);
            });
        }
      }
    },
  },
};
