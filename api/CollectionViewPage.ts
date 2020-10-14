const { v4: uuidv4 } = require('uuid');
import axios from "axios";

const CollectionBlock = require('../CollectionBlock');
import Transaction from "./Transaction"

import { error, warn } from "../utils/logs";

class CollectionViewPage extends CollectionBlock {
  constructor({ parent_data, block_data }) {
    super({ parent_data, block_data });
    if (block_data.type !== 'collection_view_page')
      throw new Error(error(`Cannot create collection_view_page block from ${block_data.type} block`));
  }

  static setStatic(obj) {
    Object.entries(obj).forEach(([key, value]) => (CollectionViewPage[key] = value));
    return CollectionViewPage;
  }
}

module.exports = CollectionViewPage;