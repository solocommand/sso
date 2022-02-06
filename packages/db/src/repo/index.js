import { RepoManager, ManagedRepo } from '@parameter1/mongodb';
import Joi, { validateAsync } from '@parameter1/joi';

import ApplicationRepo from './application.js';
import OrganizationRepo from './organization.js';
import TokenRepo from './token.js';
import UserEventRepo from './user-event.js';
import UserRepo from './user.js';
import WorkspaceRepo from './workspace.js';

export default class Repos extends RepoManager {
  /**
   * @todo create change history handlers via change streams
   *       only add items that have a modified date change
   *       this would also ignore denormalized field changes, which is good
   * @param {object} params
   * @param {MongoDBClient} params.client
   * @param {string} [params.dbBame=tenancy]
   * @param {string} params.tokenSecret
   */
  constructor({ client, dbName = 'tenancy', tokenSecret } = {}) {
    super({ client, dbName });
    this
      .add({ key: 'application', ManagedRepo: ApplicationRepo })
      .add({ key: 'organization', ManagedRepo: OrganizationRepo })
      .add({ key: 'token', ManagedRepo: TokenRepo, tokenSecret })
      .add({ key: 'user', ManagedRepo: UserRepo })
      .add({ key: 'user-event', ManagedRepo: UserEventRepo })
      .add({ key: 'workspace', ManagedRepo: WorkspaceRepo });
  }

  /**
   *
   * @param {object} params
   * @param {string} params.repo The repository key name to query
   * @param {ObjectId} [params.id] If passed, will exclude the related doc from the query
   * @param {string} params.slug The slug to check
   * @param {object} [params.query] Optional query criteria to apply
   */
  async slugHasRedirect(params = {}) {
    const {
      repo,
      id,
      slug,
      query,
    } = await validateAsync(Joi.object({
      repo: Joi.string().required(),
      id: Joi.objectId(),
      slug: Joi.slug().required(),
      query: Joi.object().default({}),
    }).required(), params);

    const doc = await this.$(repo).findOne({
      query: {
        ...query,
        redirects: slug,
        ...(id && { _id: { $ne: id } }),
      },
      options: { projection: { _id: 1 } },
    });
    return Boolean(doc);
  }

  /**
   *
   * @param {object} params
   * @param {string} params.repo The repository key name to query
   * @param {ObjectId} [params.id] If passed, will exclude the related doc from the check
   * @param {string} params.slug The slug to check
   * @param {object} [params.query] Optional query criteria to apply
   */
  async throwIfSlugHasRedirect(params = {}) {
    const {
      repo,
      id,
      slug,
      query,
    } = await validateAsync(Joi.object({
      repo: Joi.string().required(),
      id: Joi.objectId(),
      slug: Joi.slug().required(),
      query: Joi.object().default({}),
    }).required(), params);

    const hasRedirect = await this.slugHasRedirect({
      repo,
      id,
      slug,
      query,
    });
    if (hasRedirect) throw ManagedRepo.createError(409, 'An existing record is already using this slug as a redirect.');
  }
}
