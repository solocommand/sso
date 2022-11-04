import { PropTypes, attempt } from '@parameter1/sso-prop-types-core';
import { eventProps } from '@parameter1/sso-prop-types-event';
import { DB_NAME, mongoDBClientProp } from '@parameter1/sso-mongodb-core';

const { array, object } = PropTypes;

/**
 * @typedef {import("@parameter1/sso-mongodb-core").MongoClient} MongoClient
 *
 * @typedef MaterializedRepoConstructorParams
 * @property {MongoClient} mongo
 */
export class MaterializedRepo {
  /**
   * @typedef RootMaterializedRepoConstructorParams
   * @property {string} entityType
   * @property {object[]} [indexes]
   * @property {MongoClient} mongo
   *
   * @param {RootMaterializedRepoConstructorParams} params
   */
  constructor(params) {
    /** @type {RootMaterializedRepoConstructorParams} */
    const { entityType, indexes, mongo } = attempt(params, object({
      entityType: eventProps.entityType.required(),
      indexes: array().items(object()).default([]),
      mongo: mongoDBClientProp.required(),
    }).required());

    /** @type {string} */
    this.entityType = entityType;
    /** @type {object[]} */
    this.indexes = indexes;
    /** @type {MongoClient} */
    this.mongo = mongo;
    /** @type {import("@parameter1/sso-mongodb-core").Collection} */
    this.collection = mongo.db(DB_NAME).collection(`${entityType}/materialized`);
  }

  /**
   * Creates the database indexes for this materialized repo.
   *
   * @returns {Promise<string[]>}
   */
  async createIndexes() {
    const { indexes } = this;
    if (!indexes.length) return [];
    return this.collection.createIndexes(indexes);
  }
}
