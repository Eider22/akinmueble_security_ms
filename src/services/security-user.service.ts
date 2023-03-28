/* eslint-disable prefer-const */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {SecurityConfiguration} from '../config/security.config';
import {AuthenticationFactor, Credentials, User} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line prefer-const
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
    // eslint-disable-next-line prefer-const
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
   * It takes a userId and a code2fa, and if the code2fa is valid, it returns the
   * user
   * @param {AuthenticationFactor} credentials2FA - AuthenticationFactor
   * @returns The user object
   */
  async verifyCode2FA(
    credentials2FA: AuthenticationFactor,
  ): Promise<User | null> {
    let login = await this.repositoryLogin.findOne({
      where: {
        userId: credentials2FA.userId,
        code2fa: credentials2FA.code2fa,
        codeState2fa: false,
      },
    });
    if (login) {
      let user = await this.repositoryUser.findById(credentials2FA.userId);
      return user;
    }
    return null;
  }

  /**
   * jwt generation
   * @param user user information
   * @returns token
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
    let obj = jwt.verify(tk, SecurityConfiguration.keyJWT);
    return obj.role;
  }
}
