import { getProjectionForType } from '@parameter1/graphql/projection';
import createLoginLinkTemplate from '../email-templates/login-link.js';
import { send } from '../sendgrid.js';

export default {
  /**
   *
   */
  Mutation: {
    /**
     *
     */
    async loginUserFromLink(_, { input }, { ip, repos, ua }) {
      const { loginLinkToken } = input;
      return repos.$('user').magicLogin({ loginLinkToken, ip, ua });
    },

    /**
     *
     */
    async logoutUser(_, __, {
      auth,
      ip,
      repos,
      ua,
    }) {
      const authToken = await auth.getAuthToken();
      await repos.$('user').logout({ authToken, ip, ua });
      return 'ok';
    },

    /**
     *
     */
    async ownUserProfile(_, { input }, { auth, repos }, info) {
      const id = await auth.getUserId();
      const user = repos.$('user');
      await user.updateName({
        id,
        givenName: input.givenName,
        familyName: input.familyName,
      });
      const projection = getProjectionForType(info);
      return user.findByObjectId({ id, options: { projection } });
    },

    /**
     *
     */
    async sendUserLoginLink(_, { input }, { ip, repos, ua }) {
      const { email, redirectTo } = input;
      await repos.$('user').createLoginLinkToken({
        email,
        ip,
        ua,
        inTransaction: async (data) => {
          const { subject, html, text } = createLoginLinkTemplate({
            loginToken: data.token.signed,
            redirectTo,
          });
          await send({
            to: data.user.email,
            subject,
            html,
            text,
          });
        },
      });
      return 'ok';
    },
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    async currentUser(_, __, { auth, repos }, info) {
      const id = await auth.getUserId();
      const options = { projection: getProjectionForType(info) };
      return repos.$('user').findByObjectId({ id, options });
    },
  },

  /**
   *
   */
  User: {
    /**
     *
     */
    name({ givenName, familyName }) {
      return [givenName, familyName].join(' ');
    },

    /**
     *
     */
    workspaceRole({ memberships }, { input }) {
      const { id } = input;
      const membership = memberships.find((m) => `${m.workspace._id}` === `${id}`);
      return membership ? membership.role : null;
    },
  },

  /**
   *
   */
  UserAuth: {
    /**
     *
     */
    expiresAt({ authDoc }) {
      return authDoc.expiresAt;
    },

    /**
     *
     */
    user({ userId }, _, { repos }, info) {
      const options = { projection: getProjectionForType(info) };
      return repos.$('user').findByObjectId({ id: userId, options });
    },
  },
};
