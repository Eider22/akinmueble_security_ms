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
  Role,
  User,
} from '../models';
import {RoleRepository} from '../repositories';

export class RoleUserController {
  constructor(
    @repository(RoleRepository) protected roleRepository: RoleRepository,
  ) { }

  @get('/roles/{id}/users', {
    responses: {
      '200': {
        description: 'Array of Role has many User',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<User>,
  ): Promise<User[]> {
    return this.roleRepository.users(id).find(filter);
  }

  @post('/roles/{id}/users', {
    responses: {
      '200': {
        description: 'Role model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Role.prototype._id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUserInRole',
            exclude: ['_id'],
            optional: ['roleId']
          }),
        },
      },
    }) user: Omit<User, '_id'>,
  ): Promise<User> {
    return this.roleRepository.users(id).create(user);
  }

  @patch('/roles/{id}/users', {
    responses: {
      '200': {
        description: 'Role.User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: Partial<User>,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.roleRepository.users(id).patch(user, where);
  }

  @del('/roles/{id}/users', {
    responses: {
      '200': {
        description: 'Role.User DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.roleRepository.users(id).delete(where);
  }
}
