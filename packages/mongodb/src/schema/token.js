import { PropTypes } from '@sso/prop-types';
import tokenProps from './props/token.js';

const { object } = PropTypes;

export default {
  create: object({
    subject: tokenProps.subject.required(),
    audience: tokenProps.audience.required(),
    issuer: tokenProps.issuer,
    ttl: tokenProps.ttl.default(0),
    data: tokenProps.data.default({}),
  }).custom((token) => {
    const { ttl } = token;
    return {
      ...token,
      issuedAt: '$$NOW',
      ...(ttl && {
        expiresAt: { $add: ['$$NOW', ttl * 1000] },
      }),
    };
  }).required(),
};
