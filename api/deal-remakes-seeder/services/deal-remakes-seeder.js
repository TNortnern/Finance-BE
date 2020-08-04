"use strict";
const faker = require("faker");
/**
 * `deal-remakes-seeder` service.
 */

module.exports = {
  // exampleService: (arg1, arg2) => {
  //   return isUserOnline(arg1, arg2);
  // }
  seed: async () => {
    let deals = [];
    const amount = 30;
    for (let i = 0; i < amount; i++) {
      const month = `${faker.date.month().substr(0, 3)} ${
        Math.floor(Math.random() * 21) + 10
      }`;
      const company = faker.company.companyName();
      let sponsors = [];
      let lenders = [];
      for (let x = 0; x < faker.random.number(7) + 1; x++) {
        sponsors.push({ value: faker.company.companyName(), status: null });
      }
      for (let y = 0; y < faker.random.number(7) + 1; y++) {
        lenders.push({ value: faker.name.findName(), status: null });
      }
      const dealType = faker.lorem.word();
      const tranche = faker.lorem.word();
      const item = {
        title: `${company} (${month} ${sponsors[0].value} ${dealType}): ${tranche}`,
        // author: "5ef6372c6e5c8d0017a3614c",
        dealData: {
          Month: {
            value: month,
            status: null,
          },
          Year: {
            value: `20${month.split(" ")[1]}`,
          },
          Company: { value: company, status: null },
          Country: {
            value: faker.address.country(),
            status: null,
          },
          Industry: {
            value: faker.name.jobType(),
            status: null,
          },
          Business_description: { value: faker.random.words(5), status: null },
          Sponsor: {
            value: sponsors,
            status: null,
          },
          Tranche: {
            value: tranche,
            status: null,
          },
          Use_of_proceeds: {
            value: faker.lorem.word(),
            status: null,
          },
          Size_EUR: { value: faker.random.number(), status: null },
          Deal_type: {
            value: dealType,
            status: null,
          },
          Debt_advisor: {
            value: faker.name.findName(),
            status: null,
          },
          Seniority: {
            value: faker.name.findName(),
            status: null,
          },
          Currency: {
            value: faker.finance.currencyCode(),
            status: null,
          },
          Size: { value: faker.random.number(), status: null },
          EBITDA: { value: faker.random.number(), status: null },
          Tranche_leverage: {
            value: `${faker.random.number(20)}.${faker.random.number(9)}`,
            status: null,
          },
          Total_leverage: {
            value: `${faker.random.number(20)}.${faker.random.number(9)}`,
            status: null,
          },
          Alternative_lenders: {
            value: faker.random.number(10),
            status: null,
          },
          Lender: {
            value: lenders,
            status: null,
          },
          Lender_counsel: {
            value: faker.name.findName(),
            status: null,
          },
          Floating: {
            value: "Fixed",
            status: null,
          },
          Base_rate: {
            value: faker.random.alphaNumeric(1).toUpperCase(),
            status: null,
          },
          Margin: { value: `${faker.random.number(500)}`, status: null },
          Floor: { value: faker.random.number(500), status: null },
          Fees: { value: faker.random.number(500), status: null },
          Maturity: { value: "mature", status: null },
          Call_protection: { value: "callproe", status: null },
          Leverage_covenant: {
            value: "No",
            status: null,
          },
          Comments: { value: faker.random.words(7), status: null },
        },
      };
      deals.push(item);
    }
    let counter = 0;
    let creations = setInterval(async () => {
      let deal = deals[counter];
      // console.log('deal', deal)
      if (counter < (amount + 1)) {
        counter++;
        await strapi.services["deal-remake"].baseCreateDealRemake(
          deal.dealData,
          deal.title,
          deal.approved,
          process.env.ADMIN
        );
      } else {
        console.log("seeding done.");
        clearInterval(creations);
      }
    }, 5000);
  },
};
