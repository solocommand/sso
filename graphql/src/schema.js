import { makeExecutableSchema } from '@parameter1/graphql/schema';
import { enumDefaultValuesTransformer } from '@parameter1/graphql/transformers';
import {
  arrayDirectiveTransformer,
  objectDirectiveTransformer,
} from '@parameter1/graphql/directives';

import authDirectiveTransformer from './directives/auth.js';
import connectionProjectDirectiveTransformer from './directives/connection-project.js';
import projectDirectiveTransformer from './directives/project.js';
import enums from './enums.js';
import resolvers from './resolvers/index.js';
import typeDefs from './definitions/index.js';

const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

const withProject = projectDirectiveTransformer(schema);
const withConnectionProject = connectionProjectDirectiveTransformer(withProject);
const withAuth = authDirectiveTransformer(withConnectionProject);
const withArray = arrayDirectiveTransformer(withAuth);
const withObject = objectDirectiveTransformer(withArray);

// handle enum default values
const withEnumDefaults = enumDefaultValuesTransformer(withObject, enums);

export default withEnumDefaults;
