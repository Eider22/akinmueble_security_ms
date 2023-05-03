import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Where,
  repository,
} from '@loopback/repository';
import {
  HttpErrors,
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {configurationNotification} from '../config/notification.config';
import {SecurityConfiguration} from '../config/security.config';
import {
  AuthenticationFactor,
  Credentials,
  CredentialsRecoveryPassword,
  CustomResponse,
  Login,
  RoleMenuPermissions,
  User,
} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
import {NotificationService, SecurityUserService} from '../services';
import {AuthService} from '../services/auth.service';

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
    @service(AuthService)
    private serviceAuth: AuthService,
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
  ): Promise<CustomResponse> {
    try {
      let password = this.serviceSecurity.createTextRandom(10);
      let passwordEncripted = this.serviceSecurity.encriptedText(password);
      user.password = passwordEncripted;
      const newUser = await this.userRepository.create(user);
      const response: CustomResponse = new CustomResponse();

      if (!newUser) {
        response.ok = false;
        response.message = 'No se creó el ususario';
        response.data = {};
      }

      if (newUser.roleId == SecurityConfiguration.roleIds.advisor) {
        const content = `Tu usuario de asesor ha sido creado, ya eres parte de nuestro equipo.Bienvenido!
        </br> Tus credenciales son:
        </br> Usuario: ${newUser.email}
        </br> contraseña: ${password}`;

        const data = {
          destinationEmail: newUser.email!,
          destinationName:
            newUser.firstName + ' ' + newUser.secondName
              ? newUser.secondName
              : '' + '' + newUser.firstLastName,
          contectEmail: `${content}`,
          subjectEmail: configurationNotification.subjectCustomerNotification,
        };

        const url = configurationNotification.urlNotification2fa;
        this.serviceNotification.SendNotification(data, url);
      }

      newUser.password = '';
      response.ok = true;
      response.message = 'Usuario creado';
      response.data = newUser;

      return response;
    } catch (error) {
      if (error.name == 'MongoError' && error.code === 11000) {
        const userExist = await this.userRepository.findOne({
          where: {
            email: user.email,
          },
        });
        const response: CustomResponse = new CustomResponse();

        if (!userExist) {
          response.ok = false;
          response.message = 'No se creó el ususario';
          response.data = {};

          return response;
        }

        userExist.password = '';
        response.ok = true;
        response.message = 'Ya existe usuario';
        response.data = userExist;

        return response;
      }
      throw error;
    }
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
    try {
      let user = await this.serviceSecurity.identifyUser(credentials);
      if (!user) {
        throw new HttpErrors[401]('Credenciales incorrectas.');
      }

      let code2fa = this.serviceSecurity.createTextRandom(5);
      let login: Login = new Login();
      login.userId = user._id!;
      login.code2fa = code2fa;
      login.codeState2fa = false;
      this.repositoryLogin.create(login);
      user.password = '';
      // notify the user via mail or sms
      let data = {
        destinationEmail: user.email,
        destinationName: user.firstName + ' ' + user.secondName,
        contectEmail: `Su codigo de segundo factor de autentificacion es: ${code2fa}`,
        subjectEmail: configurationNotification.subject2fa,
      };
      let url = configurationNotification.urlNotification2fa;
      this.serviceNotification.SendNotification(data, url);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @post('/validate-permissions')
  @response(200, {
    description: 'Validación de permisos de un usuario para lógica de negocio',
    content: {
      'application/json': {schema: getModelSchemaRef(RoleMenuPermissions)},
    },
  })
  async ValidateUserPermissions(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RoleMenuPermissions),
        },
      },
    })
    data: RoleMenuPermissions,
  ): Promise<UserProfile | undefined> {
    let idRole = this.serviceSecurity.getRoleToken(data.token);
    return this.serviceAuth.verifiacatePermitsUserByRol(
      idRole,
      data.idMenu,
      data.action,
    );
  }

  @post('/recovery-password')
  @response(200, {
    description: 'recuperar contraseña mediante correo',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async recoveryPasswordUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredentialsRecoveryPassword),
        },
      },
    })
    credentials: CredentialsRecoveryPassword,
  ): Promise<object> {
    let user = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!user) {
      throw new HttpErrors[401]('incorrect credentials.');
    } else {
      let newPassword = this.serviceSecurity.createTextRandom(5);
      let passwordEncripted = this.serviceSecurity.encriptedText(newPassword);
      user.password = passwordEncripted;
      this.userRepository.updateById(user._id, user);
      // notify the user via mail or sms
      let data = {
        destinationNumber: user.phone,
        contentSms: `hola ${user.firstName}, su nueva clave es: ${newPassword}`,
      };
      let url = configurationNotification.urlNotificationsms;
      this.serviceNotification.SendNotification(data, url);
      return user;
    }
  }

  /**
   *  This is a controller method in a LoopBack 4 application that handles a POST
   * request to verify a two-factor authentication (2FA) code. It takes in a
   * request body containing an `AuthenticationFactor` object, which includes the
   * user's ID and the 2FA code they entered. It then calls the `verifyCode2FA`
   * method of the `serviceSecurity` instance to verify the code. If the code is
   * valid, it returns an object with the user's information. If there is an error,
   * it logs a message and throws the error.
   *
   * @param credentials
   * @returns
   */
  @post('/verify-2fa')
  @response(200, {
    description: 'verifica el 2fa',
  })
  async verifyCode2FA(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthenticationFactor),
        },
      },
    })
    credentials: AuthenticationFactor,
  ): Promise<object> {
    try {
      let data = await this.serviceSecurity.verifyCode2FA(credentials);
      return data;
    } catch (error) {
      console.log(
        'No se ha almacenado el cambio del estado del código 2fa en la base de datos.\n',
        error,
      );
      throw error;
    }
  }
}
