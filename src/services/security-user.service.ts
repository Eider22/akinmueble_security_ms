import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {SecurityConfiguration} from '../config/security.config';
import {AuthenticationFactor, Credentials, User} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class SecurityUserService {
  constructor(
    @repository(UserRepository)
    public repositoryUser: UserRepository,
    @repository(LoginRepository)
    public repositoryLogin: LoginRepository,
  ) {}

  /**
   * It creates a password with a length of 10 characters and includes numbers
   * @returns A string of n characters that includes numbers.
   */
  createTextRandom(n: number): string {
    let password = generator.generate({
      length: n,
      numbers: true,
    });
    return password;
  }

  /**
   * It takes a string as an argument and returns a string.
   * @param {string} text - string -&gt; The text that you want to encrypt.
   * @returns the textEncripted variable.
   */
  encriptedText(text: string): string {
    let textEncripted = MD5(text).toString();
    return textEncripted;
  }

  /**
   * a user is searched for their access credentials
   * @param credentials user credentials
   * @returns user found or null
   */
  async identifyUser(credentials: Credentials): Promise<User | null> {
    const user = await this.repositoryUser.findOne({
      where: {
        email: credentials.email,
        password: credentials.password,
      },
    });
    return user as User;
  }

  /**
   * This function verifies a user's 2FA code and generates a token for
   * authentication.
   * @param {AuthenticationFactor} credentials2FA - An object containing the user's
   * authentication factor information, including their user ID and 2FA code.
   * @returns An object containing the authenticated user and a token.
   */
  async verifyCode2FA(credentials2FA: AuthenticationFactor): Promise<Object> {
    let login = await this.repositoryLogin.findOne({
      where: {
        userId: credentials2FA.userId,
        code2fa: credentials2FA.code2fa,
        codeState2fa: false,
      },
    });
    if (!login) {
      throw new HttpErrors[400]('Código invalido');
    }
    let user = await this.repositoryUser.findById(credentials2FA.userId);
    if (!user) {
      throw new HttpErrors[400]('Código invalido');
    }
    login.token = this.creationToken(user);
    login.tokenState = false;
    let token = login.token;
    this.repositoryLogin.save(login);
    await this.repositoryUser.logins(user._id).patch(
      {
        codeState2fa: true,
        tokenState: false,
      },
      {
        codeState2fa: false,
        _id: login._id,
      },
    );
    user.password = '';
    return {user, token};
  }

  /**
   * The function creates a JSON Web Token (JWT) for a given user object.
   * @param {User} user - User object containing the user's first name, second name,
   * first last name, second last name, role ID, and email.
   * @returns a string which is a JSON Web Token (JWT) that contains the user's
   * name, role, and email information.
   */
  creationToken(user: User): string {
    let details = {
      name: `${user.firstName} ${user.secondName} ${user.firstLastName} ${user.secondLastName}`,
      role: user.roleId,
      email: user.email,
    };
    let token = jwt.sign(details, SecurityConfiguration.keyJWT);
    return token;
  }

  /**
   * It takes a string, decodes it, and returns a string
   * @param {string} tk - the token
   * @returns The role of the user.
   */
  getRoleToken(tk: string): string {
    try {
      let obj = jwt.verify(tk, SecurityConfiguration.keyJWT);
      return obj.role;
    } catch (error) {
      if (error.name == 'JsonWebTokenError' || error.name == 'SyntaxError') {
        throw new HttpErrors[400]('Token inválido');
      }
      throw error;
    }
  }
}
