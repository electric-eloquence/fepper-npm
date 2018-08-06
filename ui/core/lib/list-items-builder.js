'use strict';

const Pattern = require('./object-factory').Pattern;

module.exports = class {
  constructor(patternlab) {
    this.patternlab = patternlab;
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
    const listItemsArr = [];

    for (let i in container.listItems) {
      if (!container.listItems.hasOwnProperty(i)) {
        continue;
      }

      listItemsArr.push(container.listItems[i]);
    }

    this.patternlab.utils.shuffle(listItemsArr);

    let containerData;

    if (container instanceof Pattern) {
      containerData = container.jsonFileData;
    }
    else {
      containerData = container.data;
    }

    containerData.listItems = {};

    let counter = 0;

    for (let i = 0, l = counts.length; i < l; i++) {
      const count = counts[i];
      const tempItems = [];

      counter++;

      for (let j = 0; j < counter; j++) {
        if (listItemsArr[j]) {
          tempItems.push(listItemsArr[j]);
        }
        else {
          return;
        }
      }

      containerData.listItems[count] = tempItems;
    }
  }

  listItemsScan(parseArr) {
    let useListItems = this.patternlab.useListItems;

    if (useListItems) {
      return true;
    }

    for (let i = 0, l = parseArr.length; i < l; i++) {
      const parseObj = parseArr[i];

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
