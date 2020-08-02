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
const findRanks = async (deal) => {
  return [deal.Lender, deal.Debt_advisor, deal.Sponsor, deal.Lender_counsel];
};

module.exports = {
  lifecycles: {
    async beforeUpdate(params, data) {
      const currentDeal = await strapi
        .query("deal-remake")
        .findOne({ _id: params._id });
      if (!currentDeal.approved && data.approved) {
        const dataAsArr = Object.keys(currentDeal);
        dataAsArr.forEach((item) => {
          if (!currentDeal[item]) return;
          if (currentDeal[item].item) {
            currentDeal[item] = {
              value: currentDeal[item].item.value,
              status: currentDeal[item].item.status,
            };
          } else {
            if (Array.isArray(currentDeal[item])) {
              const arr = currentDeal[item];
              arr.forEach((x, i) => {
                arr[i] = {
                  value: x.item.value,
                  status: x.item.status,
                };
              });
              currentDeal[item] = { value: arr };
            }
          }
        });
        currentDeal.approved = true;
        return await strapi.services["deal-remake"].approvedDealRemake(
          currentDeal
        );
      }

      // return await strapi.services["deal-remake"].baseUpdateDealRemake(
      //   data
      // );

      // if (result.approved) {
      //
      // }
    },
    // async beforeUpdate(params, data) {
    // //   console.log("data", data);
    //   const deal = await strapi
    //     .query("deal-remake")
    //     .findOne({ id: params._id });
    //   const ranks = [
    //     deal.Lender,
    //     deal.Debt_advisor,
    //     deal.Sponsor,
    //     deal.Lender_counsel,
    //   ];
    //   if (params._id !== deal.id) {
    //     return;
    //   }
    //   if (data.Size && deal.Size.item.value !== data.Size.item.value) {
    //     const value = data.Size.item.value - Number(deal.Size.item.value);
    //     for await (const each of ranks) {
    //       const { item } = each;
    //       const rank = await strapi
    //         .query("ranking-item")
    //         .findOne({ id: item.id });
    //       const result = rank.size_total + value;
    //       // let resolveItems = rank.items;
    //       // if (!Array.isArray(resolveItems)) {
    //       //   resolveItems = []
    //       // }
    //       await strapi
    //         .query("ranking-item")
    //         .update({ id: rank.id }, { size_total: result < 0 ? 0 : result });
    //     }
    //   }
    // },
    // async beforeDelete(params) {
    //   const deal = await strapi
    //     .query("deal-remake")
    //     .findOne({ id: params._id });
    //   const ranks = [
    //     deal.Lender,
    //     deal.Debt_advisor,
    //     deal.Sponsor,
    //     deal.Lender_counsel,
    //   ];
    //   //   console.log('deal', deal)
    //   for (let each of ranks) {
    //     if (!each) {
    //       return;
    //     }
    //     const { item } = each;
    //     const rank = await strapi
    //       .query("ranking-item")
    //       .findOne({ id: item.id });
    //     if (!rank) {
    //       return;
    //     }
    //     let value = Number(rank.size_total) - Number(deal.Size.item.value);
    //     await strapi.query("ranking-item").update(
    //       { id: rank.id },
    //       {
    //         size_total: value < 0 ? 0 : value,
    //         dealAmount: rank.dealAmount - 1,
    //       }
    //     );
    //   }
    // },
  },
};
