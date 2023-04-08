/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prefer-const */
import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {configurationNotification} from '../config/notification.config';
import {SecurityConfiguration} from '../config/security.config';
import {AuthenticationFactor, Credentials, Login, User} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
import {NotificationService, SecurityUserService} from '../services';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(SecurityUserService)
    public serviceSecurity: SecurityUserService,
    @repository(LoginRepository)
    public repositoryLogin: LoginRepository,
    @service(NotificationService)
    public serviceNotification: NotificationService,
  ) {}

  @post('/user')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['_id'],
          }),
        },
      },
    })
    user: Omit<User, '_id'>,
  ): Promise<Omit<User, 'password'>> {
    // eslint-disable-next-line prefer-const
    let password = this.serviceSecurity.createTextRandom(10);
    // eslint-disable-next-line prefer-const
    let passwordEncripted = this.serviceSecurity.encriptedText(password);
    user.password = passwordEncripted;
    return this.userRepository.create(user);
  }

  @get('/user/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authenticate({
    strategy: 'auth',
    options: [
      SecurityConfiguration.menus.menuUserId,
      SecurityConfiguration.actions.listAction,
    ],
  })
  @get('/user')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/user')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/user/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/user/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/user/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/user/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  /**
   * metodos personalizados para la Api
   *
   */

  @post('/identify-user')
  @response(200, {
    description: 'identificar un usuario por correo y clave',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async identifyUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credentials),
        },
      },
    })
    credentials: Credentials,
  ): Promise<object> {
    let user = await this.serviceSecurity.identifyUser(credentials);
    if (!user) {
      throw new HttpErrors[401]('incorrect credentials.');
    }

    let code2fa = this.serviceSecurity.createTextRandom(5);
    let login: Login = new Login();
    login.userId = user._id!;
    login.code2fa = code2fa;
    login.codeState2fa = false;
    login.token = '';
    login.tokenState = false;
    this.repositoryLogin.create(login);
    // notify the user via mail or sms
    let data = {
      destinationEmail: user.email,
      destinationName: user.firstName + ' ' + user.secondName,
      contectEmail: `Su codigo de segundo factor de autentificacion es: ${code2fa}`,
      subjectEmail: configurationNotification.subject2fa,
    };
    let url = configurationNotification.urlNotification2fa;
    this.serviceNotification.SendEmailGrid(data, url);
    return user;
  }

  @post('/verify-2fa')
  @response(200, {
    description: 'verifica el 2fa',
  })

  /**
   * I want to return an object with two properties: user and token.
   * @param {AuthenticationFactor} credentials - AuthenticationFactor,
   * @returns The user object and the token.
   */
  async verifyCode2FA(
    @requestBody({
      content: {
        'aplication/json': {
          schema: getModelSchemaRef(AuthenticationFactor),
        },
      },
    })
    credentials: AuthenticationFactor,
  ): Promise<object> {
    try {
      let user = await this.serviceSecurity.verifyCode2FA(credentials);
      if (!user) {
        throw new HttpErrors[401](
          'codigo de 2fa invalido para el usuario definido.',
        );
      }
      let token = this.serviceSecurity.creationToken(user);
      user.password = '';

      this.userRepository.logins(user._id).patch(
        {
          codeState2fa: true,
          token,
        },
        {
          codeState2fa: false,
        },
      );

      return {
        user: user,
        token: token,
      };
    } catch (error) {
      console.log(
        'No se ha almacenado el cambio del estado de token en la base de datos.',
      );
      throw new HttpErrors[500](' Error interno en el servidor');
    }
  }
}
