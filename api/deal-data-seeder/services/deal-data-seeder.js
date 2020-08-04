"use strict";

/**
 * `deal-data-seeder` service.
 */
const handleMonth = (month) => {
  return month.includes("-")
    ? `${month.split("-")[0]} ${month.split("-")[1]}`
    : month;
};
module.exports = {
  // exampleService: (arg1, arg2) => {
  //   return isUserOnline(arg1, arg2);
  // }
  seed: async () => {
    for (let b = 130; b < 185; b++) {
      const data = strapi.services["deal-data"].get()[b];
      console.log("data", data);
      // data.forEach(item => {
      //   console.log(item)
      // })
      const keysOfData = Object.keys(data);
      keysOfData.forEach((item, i) => {
        if (!data[item] || data[item] === 'N/A') {
          delete data[item];
          return;
        }
        if (item === "Title") {
          delete data[item];
          return;
        }
        if (item.includes("(#)")) {
          const find = (data[item.split(" (#)")[0]] = data[item]);
          console.log("find", item.split(" #")[0]);
          delete data[item];
        }
        if (item.includes("Validity")) {
          delete data[item];
          return;
        }
        if (item === "Month") {
          data[item] = handleMonth(data[item]);
        }
        const findRepeats = keysOfData.filter((each) => {
          if (!isNaN(each.split(" ")[1]) && each !== item) {
            return each.split(" ")[0] === item.split(" ")[0];
          }
        });
        // console.log("findRepeats", findRepeats);
        let arr = [];
        let newName;
        if (findRepeats.length) {
          arr = [{ value: data[item], status: null }];
          newName = item.split(" ")[0];
          delete data[item];
        }
        if (findRepeats.length > 1) {
          findRepeats.forEach((x) => {
            const index = keysOfData.indexOf(x);
            let validity =
              keysOfData[index + 1].includes("Validity") &&
              data[keysOfData[index + 1]]
                ? data[keysOfData[index + 1]]
                : null;
            if (validity) {
              console.log("validity", validity);
            }
            arr.push({ value: data[x], status: validity });
            delete data[x];
          });
        }
        let getValidity =
          keysOfData[i + 1].includes("Validity") && data[keysOfData[i + 1]]
            ? data[keysOfData[i + 1]]
            : null;
        const resolveValue = () => {
          if (arr.length) {
            // get only items that have a value
            console.log(
              "arr.map(a => a.value)",
              arr.filter((a) => a.value)
            );
            return { value: arr.filter((a) => a.value) };
          } else {
            return { value: data[item], status: getValidity };
          }
        };
        const resolveName = () => {
          if (arr.length) {
            return newName;
          } else {
            return item;
          }
        };
        data[resolveName()] = resolveValue();
      });
      const company = (data.Company && data.Company.value) || "";
      const month = (data.Month && data.Month.value) || "";
      const sponsor = (data.Sponsor && data.Sponsor.value[0].value) || "";
      const useOfProceeds =
        (data["Use of proceeds"] && data["Use_of_proceeds"].value) || "";
        console.log('useOfProceeds', useOfProceeds)
      const trancheType =
        (data["Tranche type"] && data["Tranche_type"].value) || "";
        console.log('trancheType', trancheType)
      data.title = `${company} (${month} ${sponsor}) ${useOfProceeds}): ${trancheType}`;
      console.log("data", data);
      await strapi.services["deal-remake"].baseCreateDealRemake(
        data,
        data.title,
        data.approved || false,
        process.env.ADMIN
      );
    }
  },
};
