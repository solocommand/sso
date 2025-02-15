import loadIframe from './load-iframe';
import attachMessageListener from './attach-message-listener';
import { AuthToken } from './auth-token';
import { GraphQLClient } from './graphql-client';

export default class SSO {
  constructor({
    appKey,
    origin,
    graphqlUri,
  }) {
    if (!appKey) throw new Error('No SSO application key was provided.');
    this.appKey = appKey;
    this.origin = origin;
    this.graphql = GraphQLClient({ uri: graphqlUri });
  }

  /**
   * Gets the current auth token.
   *
   * @returns {Promise<object|null>}
   */
  async getAuthToken() {
    await this.init();
    return AuthToken.get();
  }

  /**
   * Gets the SSO login page URL with an optional `next` redirect. If no redirect is
   * provided, the current location is used.
   *
   * @param {object} params
   * @param {string} [next=window.location.href]
   * @returns {string}
   */
  getLoginPageUrl({ next = window.location.href } = {}) {
    return `${this.origin}/login?next=${encodeURIComponent(next)}&appKey=${this.appKey}`;
  }

  /**
   * Determines if an auth token is present.
   *
   * @returns {Promise<boolean>}
   */
  async hasAuthToken() {
    await this.init();
    return AuthToken.exists();
  }

  /**
   * Initializes the internals of the SSO lib.
   * @return {Promise<void>}
   */
  async init() {
    const { origin } = this;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        this.iframe = await loadIframe({ origin });
        attachMessageListener({
          origin,
          onTokenAdd: (value) => {
            AuthToken.set(value);
            window.location.reload();
          },
          onTokenRemove: () => {
            AuthToken.remove();
            this.redirectToLoginPage();
          },
        });
      })();
    }
    await this.initPromise;
  }

  /**
   * Logs the user out of SSO globally and redirects to the login page.
   *
   * @param {object} params
   * @param {string} [params.next]
   */
  async logout({ next } = {}) {
    await this.init();
    this.iframe.contentWindow.postMessage(JSON.stringify({
      key: AuthToken.getKey(),
      action: 'remove',
    }), this.origin);
    AuthToken.remove();
    this.redirectToLoginPage({ next });
  }

  /**
   * Performs a GraphQL query operation against the SSO query API.
   *
   * @param {object} params
   * @param {string|object} params.query The query, either as a string or a graphql-tag object
   * @param {object} [params.variables] Variables to send with the operation
   * @param {boolean} [params.autoLogout=true] Whether to automatically logout when an
   *                                            unauthenticated error is encountered.
   * @returns {Promise<object>}
   */
  async query({ query, variables, autoLogout = true }) {
    const token = await this.getAuthToken();
    try {
      const result = await this.graphql.query({
        query,
        variables,
        headers: { ...(token && token.value && { authorization: `Bearer ${token.value}` }) },
      });
      return result;
    } catch (e) {
      if (autoLogout === true && (e.code === 'UNAUTHENTICATED' || e.statusCode === 401)) {
        this.logout();
        return { data: {} };
      }
      throw e;
    }
  }

  /**
   * Redirects to the SSO login page with an optional redirect URL when the user
   * completes the login process. If no redirect is provided, the current location is used.
   *
   * @param {object} params
   * @param {string} [next]
   */
  redirectToLoginPage({ next } = {}) {
    const url = this.getLoginPageUrl({ next });
    window.location.href = url;
  }
}
