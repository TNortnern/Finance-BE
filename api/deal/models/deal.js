/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

// const resolveRemovedRanks = async (where) => {
//   const findRanks = await strapi.query("ranking-item").find({
//     id_in: where,
//   });
//   for await (const rank of findRanks) {
//     let getResult = (rank.size_total || 0) - deal.size;
//     await strapi.query("ranking-item").update(
//       { id: rank.id },
//       {
//         dealAmount: rank.dealAmount - 1,
//         size_total: getResult <= 0 ? 0 : getResult,
//       }
//     );
//   }
// };

module.exports = {
  lifecycles: {
    // Called before an entry is created
    // beforeCreate(data) {
    //   // if (!data.rankings) throw new Error("A ranking item is required");
    // },
    // // Called after an entry is created
    // async afterCreate(result, data) {
    //   const rankings = await await strapi.query("ranking-item").find({
    //     id_in: result.rankings,
    //   });
    //   for await (const ranking of rankings) {
    //     let currentSizeTotal = 0;
    //     if (ranking.size_total) currentSizeTotal = ranking.size_total;
    //     strapi.query("ranking-item").update(
    //       { id: ranking.id },
    //       {
    //         dealAmount: ranking.dealAmount + 1,
    //         size_total: Number(currentSizeTotal) + Number(data.size),
    //       }
    //     );
    //   }
    // },
    async beforeUpdate(params, data) {
      const deal = await strapi.query("deal").findOne({ id: params.id });
      const entries = await strapi
        .query("deal-entry")
        .find({ deal: params.id });
      const entryIds = entries.map((entry) => entry.id);
      console.log("deal.entries", entryIds);
      if (JSON.stringify(data.entries) !== JSON.stringify(entryIds)) {
        for await (const entry of entries) {
          if (!data.entries.includes(entry)) {
            await strapi.query("deal-entry").delete({
              id: entry.id,
            });
          }
        }
      }
    },
    async beforeDelete(params) {
      const deal = await strapi.query("deal").findOne({ id: params.id });
      const entries = await strapi
        .query("deal-entry")
        .find({ deal: params.id });
      for await (const entry of entries) {
        await strapi.query("deal-entry").delete({
          id: entry.id,
        });
      }
    },
  },
};
