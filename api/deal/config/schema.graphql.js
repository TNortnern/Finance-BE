const { sanitizeEntity } = require("strapi-utils");
const capitalize = (item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
};
const createFilter = async (filter, value) => {
  await strapi.query('filter-item').create({
    value,
    filter
  })
}
module.exports = {
  mutation: `
     baseCreateDeal(title: String, dealData: JSON, author: String): Deal
  `,
  resolver: {
    Mutation: {
      baseCreateDeal: {
        resolverOf: "application::deal.deal.create",
        resolver: async (parent, { dealData, title }, { context }) => {
          // const result = await strapi.query("filter-item").model.find().distinct('value');
          let size = dealData.size;
          let comments = dealData.comments;
          // const deal = await strapi.query("deal").create({
          //   title,
          //   size,
          //   comments,
          //   approved: true,
          // });
          const rankings = [
            "Lawyer",
            "Lender",
            "Debt advisor",
            "Sponsor",
            "Sponsor counsel",
            "Lender counsel",
          ];
          const filters = await strapi.query("filter").find({});
          // console.log('opt', dealData)
          const isRanking = (item) => rankings.includes(item);
          let rankIds = [];
          let filterIds = [];
          for (let x in dealData) {
            let cur = dealData[x];
            x = capitalize(x);
            let filter = null;
            let ranking = null;
            // size and comments already have been extracted so just ignore those fields
            if (x !== "Size" && x !== "Comments") {
              let value = cur;
              if (typeof cur === "object") {
                value = cur.value;
              }
              if (x.includes("_")) {
                const splitup = x.split("_");
                const reprinted = `${splitup[0]} ${splitup[1]}`;
                ranking = isRanking(reprinted)
                if (ranking) {
                  console.log('ranking', ranking)
                  //
                } else {
                  filter = filters.find((filt) => filt.name === reprinted).id;
                  console.log('filter', filter)
                }
                // console.log('reprinted', reprinted)
              } else {
                if (isRanking(x)) {
                } else {
                  filter = filters.find((filt) => filt.name === x);
                }
              }
            }
            // console.log('DealData[x]', dealData[x.toString()])
          }
          console.log("size", size);
          console.log("comments", comments);
          // const rank = await strapi.query('ranking').findOne({ name: ranking })
          // console.log('heyt')
          // console.log('rank', rank.id)
        },
      },
    },
  },
};
