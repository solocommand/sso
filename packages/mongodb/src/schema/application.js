import { PropTypes } from '@sso/prop-types';
import applicationProps from './props/application.js';

const { object } = PropTypes;

export default {
  create: object({
    name: applicationProps.name.required(),
    key: applicationProps.key.required(),
    roles: applicationProps.roles.default(['Administrator', 'Member']),
  }).required(),
  updateProps: object({
    name: applicationProps.name,
  }).default(),
};
