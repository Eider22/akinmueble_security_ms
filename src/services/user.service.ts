import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as crypto from 'crypto';
import {configurationNotification} from '../config/notification.config';
import {SecurityConfiguration} from '../config/security.config';
import {CustomResponse, User} from '../models';
import {RoleRepository, UserRepository} from '../repositories';
import {NotificationService} from './notification.service';
import {SecurityUserService} from './security-user.service';

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @service(SecurityUserService)
    public serviceSecurity: SecurityUserService,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(RoleRepository)
    protected roleRepository: RoleRepository,
    @service(NotificationService)
    public notificationService: NotificationService,
  ) {}

  async createUser(user: User): Promise<CustomResponse> {
    const response: CustomResponse = new CustomResponse();
    let newUser = null;

    const role = await this.roleRepository.findById(user.roleId);

    if (!role) {
      (response.ok = false), (response.message = 'El rol enviado no existe');
      response.data = {};
      return response;
    }

    if (role.name == 'Cliente') {
      newUser = await this.createCustomerUser(user);
    }

    if (role.name == 'Asesor') {
      newUser = await this.createAdvisorUser(user);
    }

    if (!newUser) {
      response.ok = false;
      response.message = 'No se creó el ususario';
      response.data = {};
      return response;
    }

    newUser.password = '';
    newUser.hash = '';
    response.ok = true;
    response.message = 'Usuario creado';
    response.data = newUser;

    return response;
  }
  async createAdvisorUser(user: User): Promise<User> {
    const password = this.serviceSecurity.createTextRandom(10);
    const passwordEncripted = this.serviceSecurity.encriptedText(password);
    user.password = passwordEncripted;

    const newUser = await this.userRepository.create(user);

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
    this.notificationService.SendNotification(data, url);

    return newUser;
  }

  async createCustomerUser(user: User): Promise<User> {
    const secretKey = SecurityConfiguration.hashSecretKey;
    const hash = crypto.createHash('sha256');
    hash.update(user.email + new Date().toISOString() + secretKey);
    const emailVerificationHash = hash.digest('hex');

    user.hash = emailVerificationHash;
    user.hashState = false;

    const passwordEncripted = this.serviceSecurity.encriptedText(
      user.password!,
    );
    user.password = passwordEncripted;

    const newUser = await this.userRepository.create(user);

    const data = {
      destinationEmail: user.email,
      destinationName: user.firstName + ' ' + user.secondName,
      contectEmail: `Tu usuario ha sido creado, para que puedas ingresar por favor verifica tu correo dando click sobre este enlace:  http://localhost:3000/veryfyEmail/${emailVerificationHash}`,
      subjectEmail: configurationNotification.subject2fa,
    };

    const url = configurationNotification.urlNotification2fa;
    this.notificationService.SendNotification(data, url);

    return newUser;
  }

  async verifyEmail(hash: string): Promise<CustomResponse> {
    const response: CustomResponse = new CustomResponse();
    const user = await this.userRepository.findOne({
      where: {
        hash: hash,
        hashState: false,
      },
    });

    if (!user) {
      response.ok = false;
      response.message = 'Su usuario no se ha podido validar';
      response.data = {};

      return response;
    }

    response.ok = true;
    response.message = '¡Felicidades! su usuario ha sido validado';
    response.data = {};

    user.hashState = true;
    await this.userRepository.save(user);

    return response;
  }
}
