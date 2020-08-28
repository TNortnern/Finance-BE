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
          let url;
          if ((process.env.NODE_ENV || '').trim() !== 'production') {
            url = 'https://privatedebtdeals.herokuapp.com'
          } else {
            url = 'https://privatedebtdeals.herokuapp.com'
          }
          await axios
            .post(`${url}/send-confirm`, {
              email: user.email, // user's email
              to: user.email,
              from: {
                email: process.env.EMAIL_FROM,
              },
              reply_to: {
                email: process.env.EMAIL_FROM,
              },
            })
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
