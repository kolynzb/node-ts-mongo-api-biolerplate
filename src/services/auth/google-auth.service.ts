import googleAuthClient from '@config/google-auth.config';
import User, { UserDocument } from '@models/user.model';


/**
 * This class handles the Google OAuth authentication flow and user creation in your application.
 */
export default class GoogleAuthService {
  /**
   * This method generates and returns the authorization URL for the user to grant our application access to their Google account.
   * @param scopes - An array of strings representing the scopes the application is requesting access to.
   * @returns {string} - The authorization URL.
   */
  getAuthUrl(scopes: string[]) {
    return googleAuthClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
    });
  }

  /**
   * This method exchanges the authorization code for access and refresh tokens using the `getToken()` method of the OAuth2Client
   * @param code - The authorization code returned by the OAuth flow.
   * @returns {Object} - An object containing the access and refresh tokens.
   */
  async getTokensFromCode(code: string) {
    const { tokens } = await googleAuthClient.getToken(code);
    return tokens;
  }

  /**
   * This method sets the credentials for the Google OAuth client.
   * @param tokens - An object containing the access and refresh tokens.
   */
  setCredentials(tokens: any) {
    googleAuthClient.setCredentials(tokens);
  }

  /**
   * This method retrieves the user profile information from the Google API using the authenticated OAuth client.
   * @returns {Object} - An object containing the user profile information.
   */
  async getUserProfile() {
    const res = await googleAuthClient.request({
      method: 'GET',
      url: 'https://www.googleapis.com/oauth2/v1/userinfo',
    });
    return res.data;
  }

  /**
   * This method verifies the provided ID token, retrieves the user's unique identifier from the token payload, and checks if the user already exists in the database. If the user doesn't exist, creates a new user account in the database.
   * @param idToken - The ID token to verify.
   * @returns {Object} - The user account details.
   */
  async authenticate(idToken: string) {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: googleAuthClient._clientId,
    });
    const payload = ticket.getPayload();
    const userId = payload?.sub;

    // Check if the user already exists in your database
    let user = await User.findOne({ where: { googleId: userId } });
    if (!user) {
      // If the user doesn't exist, create a new user account in your database

      user = await User.create({
          googleId: userId as string,
          firstName: payload?.given_name,
          lastName: payload?.family_name,
          avatar: payload?.picture,
          isEmailVerified: payload?.email_verified,
          email: payload?.email as string,
        });
      return user;
    }

    return user;
  }

  /**
   * This method initiates the OAuth flow, exchanges the authorization code for access and refresh tokens, retrieves the user's profile information, and creates a new user account in the database.
   * @param code - The authorization code returned by the OAuth flow.
   * @returns {Object} - The newly created user account details.
   */
  async signUp(code: string) {
    const tokens = await this.getTokensFromCode(code);
    this.setCredentials(tokens);

    const profile: any = await this.getUserProfile();

    // Create a new user account in your database
    const user = await User.create({
        googleId: profile?.id,
        firstName: profile?.given_name,
        lastName: profile?.family_name,
        avatar: profile?.picture,
        isEmailVerified: profile?.email_verified,
        email: profile?.email as string,
      });

    return user;
  }
}
