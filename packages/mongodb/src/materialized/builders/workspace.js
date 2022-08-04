import { BaseBuilder } from './-base.js';
import { fullWorkspace, partialApplication, partialOrganization } from './-projections.js';

export class WorkspaceBuilder extends BaseBuilder {
  /**
   *
   * @param {object} params
   * @param {string} params.entityType
   */
  constructor() {
    super({ entityType: 'workspace' });
  }

  static buildPipelineStages() {
    const stages = [];
    // application
    stages.push({
      $lookup: {
        from: 'application/normalized',
        localField: 'appId',
        foreignField: '_id',
        as: '_edge.application.node',
        pipeline: [
          { $project: partialApplication() },
        ],
      },
    }, {
      // flatten the app into a single object
      $unwind: { path: '$_edge.application.node', preserveNullAndEmptyArrays: true },
    }, {
      $set: {
        // mark the workspace as deleted if the app is deleted.
        _deleted: {
          $cond: [{ $eq: ['$_edge.application.node._deleted', true] }, true, '$_deleted'],
        },
      },
    });

    // organization
    stages.push({
      $lookup: {
        from: 'organization/normalized',
        localField: 'orgId',
        foreignField: '_id',
        as: '_edge.organization.node',
        pipeline: [
          { $project: partialOrganization() },
        ],
      },
    }, {
      // flatten the org into a single object
      $unwind: { path: '$_edge.organization.node', preserveNullAndEmptyArrays: true },
    }, {
      $set: {
        // mark the workspace as deleted if the org is deleted.
        _deleted: {
          $cond: [{ $eq: ['$_edge.organization._deleted', true] }, true, '$_deleted'],
        },
      },
    });

    stages.push({
      $set: {
        name: {
          default: '$name',
          full: {
            $concat: [
              '$_edge.application.node.name', ' > ',
              '$_edge.organization.node.name', ' > ',
              '$name',
            ],
          },
          parts: [
            '$_edge.application.node.name',
            '$_edge.organization.node.name',
            '$name',
          ],
          path: {
            $concat: [
              '$_edge.application.node.slug', '/',
              '$_edge.organization.node.slug', '/',
              '$slug',
            ],
          },
        },
        namespace: {
          default: {
            $concat: [
              '$_edge.application.node.key', '/',
              '$_edge.organization.node.key', '/',
              '$key',
            ],
          },
          application: {
            $concat: [
              '$_edge.organization.node.key', '/',
              '$key',
            ],
          },
        },
      },
    });
    stages.push({ $project: fullWorkspace() });
    return stages;
  }
}
