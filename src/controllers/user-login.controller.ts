import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  Login,
} from '../models';
import {UserRepository} from '../repositories';

export class UserLoginController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/logins', {
    responses: {
      '200': {
        description: 'Array of User has many Login',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Login)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Login>,
  ): Promise<Login[]> {
    return this.userRepository.logins(id).find(filter);
  }

  @post('/users/{id}/logins', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Login)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype._id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Login, {
            title: 'NewLoginInUser',
            exclude: ['_id'],
            optional: ['userId']
          }),
        },
      },
    }) login: Omit<Login, '_id'>,
  ): Promise<Login> {
    return this.userRepository.logins(id).create(login);
  }

  @patch('/users/{id}/logins', {
    responses: {
      '200': {
        description: 'User.Login PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Login, {partial: true}),
        },
      },
    })
    login: Partial<Login>,
    @param.query.object('where', getWhereSchemaFor(Login)) where?: Where<Login>,
  ): Promise<Count> {
    return this.userRepository.logins(id).patch(login, where);
  }

  @del('/users/{id}/logins', {
    responses: {
      '200': {
        description: 'User.Login DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Login)) where?: Where<Login>,
  ): Promise<Count> {
    return this.userRepository.logins(id).delete(where);
  }
}
