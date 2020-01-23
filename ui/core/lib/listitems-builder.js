'use strict';

const Pattern = require('./object-factory').Pattern;

module.exports = class {
  constructor(patternlab) {
    this.config = patternlab.config;
    this.utils = patternlab.utils;
  }

  listItemsBuild(container) {
    const counts = [
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve'
    ];

    const listItemsArr = Object.values(container.listItems);

    this.utils.shuffle(listItemsArr);

    let containerData;

    if (container instanceof Pattern) {
      containerData = container.jsonFileData;
    }
    else {
      containerData = container.data;
    }

    containerData.listItems = {};

    let counter = 0;

    // 0 FOR-LOOP LEVELS IN.
    for (let in0 = 0, le0 = counts.length; in0 < le0; in0++) {
      const count = counts[in0];
      const tempItems = [];

      counter++;

      // 1 FOR-LOOP LEVELS IN.
      for (let in1 = 0; in1 < counter; in1++) {
        if (listItemsArr[in1]) {
          tempItems.push(listItemsArr[in1]);
        }
        else {
          return;
        }
      }

      containerData.listItems[count] = tempItems;
    }
  }

  listItemsScan(parseArr) {
    let useListItems = this.config.useListItems;

    if (useListItems) {
      return true;
    }

    // 0 FOR-LOOP LEVELS IN.
    for (let in0 = 0, le0 = parseArr.length; in0 < le0; in0++) {
      const parseObj = parseArr[in0];

      if (
        parseObj.tag &&
        parseObj.tag === '#' &&
        parseObj.n &&
        parseObj.n.indexOf('listItems.') === 0
      ) {
        useListItems = true;

        break;
      }

      else if (parseObj.nodes) {
        useListItems = this.listItemsScan(parseObj.nodes);
      }
    }

    return useListItems;
  }
};
