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
    beforeCreate(data) {
      if (!data.rankings) throw new Error("A ranking item is required");
    },
    // Called after an entry is created
    async afterCreate(result, data) {
      // console.log('result', result)
      const rankings = await await strapi.query("ranking-item").find({
        id_in: result.rankings,
      });
      for await (const ranking of rankings) {
        let currentSizeTotal = 0;
        if (ranking.size_total) currentSizeTotal = ranking.size_total;
        strapi.query("ranking-item").update(
          { id: ranking.id },
          {
            dealAmount: ranking.dealAmount + 1,
            size_total: Number(currentSizeTotal) + Number(data.size),
          }
        );
      }
      // console.log('rankings', rankings)
    },
    async beforeUpdate(params, data) {
      if (!data.rankings.length) throw new Error("A ranking item is required");
      const deal = await strapi.query("deal").findOne({ id: params._id });
      const incomingRanks = data.rankings;
      let newRanks = [];
      let oldRanks = [];
      let removedRanks = [];
      if (incomingRanks.length !== deal.rankings.length) {
        const currentDealRankings = deal.rankings.map((d) => d.id);
        // check what ranks are new and old
        incomingRanks.forEach((cur) => {
          if (currentDealRankings.includes(cur)) oldRanks = [...oldRanks, cur];
          else newRanks = [...newRanks, cur];
        });
        // check what ranks are getting removed
        currentDealRankings.forEach((cur) => {
          // if the new rankings don't have any of the current rankings, it had to have been removed
          if (!incomingRanks.includes(cur))
            removedRanks = [...removedRanks, cur];
        });
      }
      // these conditions implies that the size value was updated
      if (data.size > deal.size || data.size < deal.size) {
        if (removedRanks.length) {
          const findRemovedRanks = await strapi.query("ranking-item").find({
            id_in: removedRanks,
          });
          for await (const rank of findRemovedRanks) {
            let getResult = (rank.size_total || 0) - deal.size;
            await strapi.query("ranking-item").update(
              { id: rank.id },
              {
                dealAmount: rank.dealAmount - 1,
                size_total: getResult <= 0 ? 0 : getResult,
              }
            );
          }
        }
        if (oldRanks.length) {
          const findOldRanks = await strapi.query("ranking-item").find({
            id_in: oldRanks,
          });
          for await (const rank of findOldRanks) {
            let getResult = (rank.size_total || 0) + data.size - deal.size;
            await strapi.query("ranking-item").update(
              { id: rank.id },
              {
                size_total: getResult <= 0 ? 0 : getResult,
              }
            );
          }
        }
        if (newRanks.length) {
          const findNewRanks = await strapi.query("ranking-item").find({
            id_in: newRanks,
          });
          for await (const rank of findNewRanks) {
            let getResult = (rank.size_total || 0) + data.size;
            await strapi.query("ranking-item").update(
              { id: rank.id },
              {
                dealAmount: rank.dealAmount + 1,
                size_total: getResult <= 0 ? 0 : getResult,
              }
            );
          }
        }
      } else {
        if (newRanks.length) {
          const findNewRanks = await strapi.query("ranking-item").find({
            id_in: newRanks,
          });
          for await (const rank of findNewRanks) {
            let getResult = (rank.size_total || 0) + deal.size;
            await strapi.query("ranking-item").update(
              { id: rank.id },
              {
                dealAmount: rank.dealAmount + 1,
                size_total: getResult <= 0 ? 0 : getResult,
              }
            );
          }
        }
        if (removedRanks.length) {
          const findRemovedRanks = await strapi.query("ranking-item").find({
            id_in: removedRanks,
          });
          for await (const rank of findRemovedRanks) {
            let getResult = (rank.size_total || 0) - deal.size;
            await strapi.query("ranking-item").update(
              { id: rank.id },
              {
                dealAmount: rank.dealAmount - 1,
                size_total: getResult <= 0 ? 0 : getResult,
              }
            );
          }
        }
      }
    },
    // Called after an entry is created
    async afterUpdate(result, params, data) {},
    async afterDelete(result, params) {
      console.log("result", result);
      const rankings = result.rankings.map((r) => r.id);
      if (rankings.length) {
        const findRanks = await strapi.query("ranking-item").find({
          id_in: rankings,
        });
        for await (const rank of findRanks) {
          let getResult = (rank.size_total || 0) - result.size;
          await strapi.query("ranking-item").update(
            { id: rank.id },
            {
              dealAmount: rank.dealAmount - 1,
              size_total: getResult <= 0 ? 0 : getResult,
            }
          );
        }
      }
    },
  },
};
