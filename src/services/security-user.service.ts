/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable eqeqeq */

interface formUser {
  firstName: string;
  secondName: string;
  firstLastName: string;
  secondLastName: string;
  email: string;
  password: string;
  phone: string;
  idrole: string;
}

import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {configurationNotification} from '../config/notification.config';
import {SecurityConfiguration} from '../config/security.config';
import {
  AuthenticationFactor,
  Credentials,
  CustomResponse,
  Login,
  User,
} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
import {NotificationService} from './notification.service';
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
    @service(NotificationService)
    protected notificationService: NotificationService,
  ) {}

  /**
   * It creates a password with a length of 10 characters and includes numbers
   * @returns A string of n characters that includes numbers.
   */
  createTextRandom(n: number): string {
    const password = generator.generate({
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
    const textEncripted = MD5(text).toString();
    return textEncripted;
  }

  /**
   * a user is searched for their access credentials
   * @param credentials user credentials
   * @returns user found or null
   */
  async identifyUser(credentials: Credentials): Promise<CustomResponse> {
    const response: CustomResponse = new CustomResponse();
    const user = await this.repositoryUser.findOne({
      where: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    if (!user) {
      throw new HttpErrors[401]('Credenciales incorrectas.');
    }

    if (user.roleId == SecurityConfiguration.roleIds.customer) {
      if (!user.hash || !user.hashState) {
        response.ok = false;
        response.message = 'El correo no ha sido validado';
        response.data = {};
        return response;
      }
    }

    const code2fa = this.createTextRandom(5);
    const login: Login = new Login();
    login.userId = user._id!;
    login.code2fa = code2fa;
    login.codeState2fa = false;
    this.repositoryLogin.create(login);
    user.password = '';
    // notify the user via mail or sms
    const data = {
      destinationEmail: user.email,
      destinationName: user.firstName + ' ' + user.secondName,
      contectEmail: `Su codigo de segundo factor de autentificacion es: ${code2fa}`,
      subjectEmail: configurationNotification.subject2fa,
    };
    const url = configurationNotification.urlNotification2fa;
    this.notificationService.SendNotification(data, url);

    response.ok = true;
    response.message = 'Usuario identificado con éxito';
    response.data = user;

    return response;
  }

  /**
   * This function verifies a user's 2FA code and generates a token for
   * authentication.
   * @param {AuthenticationFactor} credentials2FA - An object containing the user's
   * authentication factor information, including their user ID and 2FA code.
   * @returns An object containing the authenticated user and a token.
   */
  async verifyCode2FA(
    credentials2FA: AuthenticationFactor,
  ): Promise<CustomResponse> {
    const response: CustomResponse = new CustomResponse();
    const login = await this.repositoryLogin.findOne({
      where: {
        userId: credentials2FA.userId,
        code2fa: credentials2FA.code2fa,
        codeState2fa: false,
      },
    });
    if (!login) {
      throw new HttpErrors[400]('Código invalido');
    }
    const user = await this.repositoryUser.findById(credentials2FA.userId);
    if (!user) {
      throw new HttpErrors[400]('Código invalido');
    }
    login.token = this.creationToken(user);
    login.tokenState = false;
    const token = login.token;
    try {
      await this.repositoryLogin.save(login);
      console.log('Login guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el login:', error);
      throw new HttpErrors[400]('Error al guardar el login');
    }
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

    response.ok = true;
    response.message = '2fa verificado con éxito';
    response.data = {user, token};
    return response;
  }

  /**
   * The function creates a JSON Web Token (JWT) for a given user object.
   * @param {User} user - User object containing the user's first name, second name,
   * first last name, second last name, role ID, and email.
   * @returns a string which is a JSON Web Token (JWT) that contains the user's
   * name, role, and email information.
   */
  creationToken(user: User): string {
    const details = {
      name: `${user.firstName} ${user.secondName} ${user.firstLastName} ${user.secondLastName}`,
      role: user.roleId,
      email: user.email,
    };
    const token = jwt.sign(details, SecurityConfiguration.keyJWT);
    return token;
  }

  /**
   * It takes a string, decodes it, and returns a string
   * @param {string} tk - the token
   * @returns The role of the user.
   */
  getRoleToken(tk: string): string {
    try {
      const obj = jwt.verify(tk, SecurityConfiguration.keyJWT);
      return obj.role;
    } catch (error) {
      if (error.name == 'JsonWebTokenError' || error.name == 'SyntaxError') {
        throw new HttpErrors[400]('Token inválido');
      }
      throw error;
    }
  }

  async createUser(json: formUser) {
    const newUser = {
      firstName: json.firstName,
      secondName: json.secondName,
      secondLastName: json.secondLastName,
      firstLastName: json.firstLastName,
      email: json.email,
      phone: json.phone,
      password: json.password,
      idrole: json.idrole,
    };

    const newCreateUser = await this.repositoryUser.create(newUser);
    if (!newCreateUser) {
      throw new HttpErrors[400]('No se pudo crear el user');
    }

    return {newCreateUser};
  }
}
