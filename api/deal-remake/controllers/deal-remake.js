"use strict";
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const capitalize = (item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
};
let deal;
const rankingArrayHandler = async (ranking, key, value) => {
  // console.log('ranking', ranking)
  let arr = [];
  for await (const rank of value) {
    let ranking_item = await strapi
      .query("ranking-item")
      .findOne({ value: rank.value });
    if (
      !ranking_item ||
      ranking_item.ranking.name.toLowerCase() !== ranking.name.toLowerCase()
    ) {
      ranking_item = await strapi.query("ranking-item").create({
        ranking: ranking.id,
        value: rank.value,
        deal: deal.id,
        size_total: deal.Size.item.value,
        dealAmount: 1,
        deal_remakes: [deal.id],
      });
    } else {
      const aritems = ranking_item.deal_remakes || [];
      aritems.push(deal.id);
      await strapi.query("ranking-item").update(
        { id: ranking_item.id },
        {
          size_total: ranking_item.size_total + Number(deal.Size.item.value),
          dealAmount: ranking_item.dealAmount + 1,
          deal_remakes: aritems,
        }
      );
    }
    arr = [
      ...arr,
      {
        item: {
          value: ranking_item.value,
          status: rank.status || null,
          id: ranking_item.id,
        },
      },
    ];
  }
  await strapi.query("deal-remake").update(
    { id: deal.id },
    {
      [key]: arr,
    }
  );
};
const filterArrayHandler = async (filter, key, value) => {
  let arr = [];
  for await (const filt of value) {
    let filter_item = await strapi
      .query("filter-item")
      .findOne({ value: filt.value });
    if (
      !filter_item ||
      filter_item.filter.name.toLowerCase() !== filter.name.toLowerCase()
    ) {
      filter_item = await strapi.query("filter-item").create({
        filter: filter.id,
        value: filt,
      });
    }
    arr = [
      ...arr,
      {
        item: {
          value: filter_item.value,
          status: filter.status || null,
          id: filter_item.id,
        },
      },
    ];
  }
  // console.log("arr", arr);
  await strapi.query("deal-remake").update(
    { id: deal.id },
    {
      [key]: arr,
    }
  );
};

const filterItemHandler = async (filter, key, item) => {
  if (Array.isArray(item.value)) {
    await filterArrayHandler(filter, key, item.value);
    return;
  }
  let filter_item = await strapi
    .query("filter-item")
    .findOne({ value: item.value });
  if (
    !filter_item ||
    !filter ||
    filter_item.filter.name.toLowerCase() !== filter.name.toLowerCase()
  ) {
    filter_item = await strapi.query("filter-item").create({
      filter: filter.id,
      value: item.value,
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
          status: item.status || null,
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
  async filterHandler(filter, key, item, passedDeal) {
    deal = passedDeal;
    // if (key === "Is_EBITDA_above_10m") {
    //   return await strapi
    //     .query("deal-remake")
    //     .update({ id: deal.id }, { [key]: { value, status: null } });
    // }
    await filterItemHandler(filter, key, item);
  },
  async rankingHandler(ranking, key, item, passedDeal) {
    // console.log('ranking before', ranking)
    deal = passedDeal;
    if (Array.isArray(item.value)) {
      // console.log("isanarray", item.value);
      await rankingArrayHandler(ranking, key, item.value);
      return;
    }
    let ranking_item = await strapi
      .query("ranking-item")
      .findOne({ value: item.value });
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
      ranking_item = await strapi.query("ranking-item").create({
        ranking: ranking.id,
        value: item.value,
        size_total: deal.Size.item.value,
        dealAmount: 1,
        deal_remakes: [deal.id],
      });
      resolvedValue = ranking_item.value;
      resolvedId = ranking_item.id;
    } else {
      const aritems = ranking_item.deal_remakes || [];
      aritems.push(deal.id);
      await strapi.query("ranking-item").update(
        { id: ranking_item.id },
        {
          size_total: ranking_item.size_total + Number(deal.Size.item.value),
          dealAmount: ranking_item.dealAmount + 1,
          deal_remakes: aritems
        }
      );
    }
    return await strapi.query("deal-remake").update(
      { id: deal.id },
      {
        [capitalize(key)]: {
          item: {
            value: resolvedValue || value,
            status: item.status || null,
            id: resolvedId,
            isRanking: true,
          },
        },
      }
    );
  },
};
