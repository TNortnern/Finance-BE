"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  getRankings() {
    return [
      {
        id: "5ef782a0eaa67c240465a46d",
        name: "Lender",
      },
      {
        id: "5ef782a8eaa67c240465a46e",
        name: "Debt advisor",
      },
      {
        id: "5ef782aceaa67c240465a46f",
        name: "Sponsor",
      },
      {
        id: "5ef782b4eaa67c240465a470",
        name: "Sponsor counsel",
      },
      {
        id: "5ef783a9eaa67c240465a471",
        name: "Lender counsel",
      },
    ];
  },
  addUnderscore(item) {
    if (item.includes(" ")) {
      return item.split(" ").join("_");
    }
  },
};
