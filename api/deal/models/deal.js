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
      const deal = await strapi.query("deal").findOne({ id: params._id });
      if (params._id !== deal.id) {
        return;
      }
      if (data.size && deal.size !== data.size) {
        const value = data.size - deal.size;

        const entries = await strapi
          .query("deal-entry")
          .find({ deal: params._id });
        const entriesWithRanks = entries.filter(
          (entry) => entry.ranking_item !== undefined
        );
        for await (const e of entriesWithRanks) {
          await strapi
            .query("ranking-item")
            .update({ id: e.ranking_item.id }, { size_total: e.ranking_item.size_total + 20 });
        }
      }
    },
    async beforeDelete(params) {
      const deal = await strapi.query("deal").findOne({ id: params._id });
      if (params._id !== deal.id) {
        return;
      }
      await strapi.query("deal-entry").delete({
        deal: deal.id,
      });
    },
  },
};
