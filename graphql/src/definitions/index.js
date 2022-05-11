import { gql } from '@parameter1/graphql/tag';
import {
  paginationDefinitions,
  sortOrderDefinitions,
} from '@parameter1/graphql/features';

import application from './application.js';
import organization from './organization.js';
import user from './user.js';
import workspace from './workspace.js';

export default gql`

scalar DateTime
scalar ObjectID

directive @auth on FIELD_DEFINITION
directive @array(field: String) on FIELD_DEFINITION
directive @connectionProject(type: String!) on OBJECT
directive @object(field: String) on FIELD_DEFINITION
directive @project(field: String, needs: [String!]! = [], deep: Boolean! = false, resolve: Boolean! = true) on FIELD_DEFINITION

type Query {
  "A simple ping/pong query."
  ping: String!
}

type Mutation {
  "A simple ping/pong mutation."
  ping: String!
}

${paginationDefinitions}
${sortOrderDefinitions}

${application}
${organization}
${user}
${workspace}

`;
