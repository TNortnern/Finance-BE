"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const capitalize = (item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
};
let deal;
const filterArrayHandler = async (filter, key, value) => {
  let arr = [];
  for await (const filt of value) {
    // console.log("filt", filt);
    let filter_item = await strapi
      .query("filter-item")
      .findOne({ value: filt });
    // console.log("filter_item", filter_item);
    if (
      !filter_item ||
      filter_item.filter.name.toLowerCase() !== filter.name.toLowerCase()
    ) {
      filter_item = await strapi.query("filter-item").create({
        filter: filter.id,
        value: filt,
      });
    }
    // console.log('filter_item.value', filter_item.value)
    arr = [
      ...arr,
      { item: { value: filter_item.value, status: null, id: filter_item.id } },
    ];
  }
  console.log("arr", arr);
  await strapi.query("deal-remake").update(
    { id: deal.id },
    {
      [key]: arr,
    }
  );
};

const filterItemHandler = async (filter, key, value) => {
  if (Array.isArray(value)) {
    await filterArrayHandler(filter, key, value);
    return;
  }
  let filter_item = await strapi.query("filter-item").findOne({ value });
  if (
    !filter_item ||
    !filter ||
    filter_item.filter.name.toLowerCase() !== filter.name.toLowerCase()
  ) {
    filter_item = await strapi.query("filter-item").create({
      filter: filter.id,
      value,
    });
  }
  if (!filter_item) {
    return;
  }
  // console.log('gets this far', value)
  await strapi.query("deal-remake").update(
    { id: deal.id },
    {
      [key]: {
        item: {
          value: filter_item.value,
          status: null,
          id: filter_item.id,
        },
      },
    }
  );
};

module.exports = {
  async sorter(ctx) {
    const deals = await strapi.query("deal-remake").find();
    return deals;
  },
  async filterHandler(filter, key, value, passedDeal) {
    deal = passedDeal;
    if (key === "Is_EBITDA_above_10m") {
      return await strapi
        .query("deal-remake")
        .update({ id: deal.id }, { [key]: { value, status: null } });
    }
    if (key.toLowerCase() === "ebitda") {
      key = "EBITDA";
    }
    await filterItemHandler(filter, key, value);
  },
  async rankingHandler(ranking, key, value, passedDeal) {
    deal = passedDeal;
    // if (Array.isArray(value)) {
    //   console.log('isanarray', value)
    //   await rankingArrayHandler(filter, key, value);
    //   return;
    // }
    // console.log('value', ranking)
    let ranking_item = await strapi.query("ranking-item").findOne({ value });
    let resolvedValue = ranking_item ? ranking_item.value : "";
    let resolvedId = ranking_item ? ranking_item.id : "";
    let matcher;
    if (ranking_item) {
      if (key.includes("_")) {
        let temp = key.split("_")[0] + " " + key.split("_")[1];
        matcher =
          temp.toLowerCase() === ranking_item.ranking.name.toLowerCase();
      } else {
        matcher = key.toLowerCase() === ranking_item.ranking.name.toLowerCase();
      }
    }
    if (!matcher) {
      console.log("matcher did not work worked");
      ranking_item = await strapi.query("ranking-item").create({
        ranking: ranking.id,
        value,
        deal: deal.id,
        size_total: deal.Size.item.value,
        dealAmount: 1,
        deal_remakes: [deal.id],
      });
      resolvedValue = ranking_item.value;
      resolvedId = ranking_item.id;
    } else {
      await strapi.query("ranking-item").update(
        { id: ranking_item.id },
        {
          size_total: ranking_item.size_total + Number(deal.Size.item.value),
          dealAmount: ranking_item.dealAmount + 1,
        }
      );
    }
    return await strapi.query("deal-remake").update(
      { id: deal.id },
      {
        [capitalize(key)]: {
          item: {
            value: resolvedValue || value,
            status: null,
            id: resolvedId,
            isRanking: true,
          },
        },
      }
    );
  },
};
