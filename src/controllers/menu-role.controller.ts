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
Menu,
RoleMenu,
Role,
} from '../models';
import {MenuRepository} from '../repositories';

export class MenuRoleController {
  constructor(
    @repository(MenuRepository) protected menuRepository: MenuRepository,
  ) { }

  @get('/menus/{id}/roles', {
    responses: {
      '200': {
        description: 'Array of Menu has many Role through RoleMenu',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Role)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Role>,
  ): Promise<Role[]> {
    return this.menuRepository.roles(id).find(filter);
  }

  @post('/menus/{id}/roles', {
    responses: {
      '200': {
        description: 'create a Role model instance',
        content: {'application/json': {schema: getModelSchemaRef(Role)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Menu.prototype._id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {
            title: 'NewRoleInMenu',
            exclude: ['_id'],
          }),
        },
      },
    }) role: Omit<Role, '_id'>,
  ): Promise<Role> {
    return this.menuRepository.roles(id).create(role);
  }

  @patch('/menus/{id}/roles', {
    responses: {
      '200': {
        description: 'Menu.Role PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {partial: true}),
        },
      },
    })
    role: Partial<Role>,
    @param.query.object('where', getWhereSchemaFor(Role)) where?: Where<Role>,
  ): Promise<Count> {
    return this.menuRepository.roles(id).patch(role, where);
  }

  @del('/menus/{id}/roles', {
    responses: {
      '200': {
        description: 'Menu.Role DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Role)) where?: Where<Role>,
  ): Promise<Count> {
    return this.menuRepository.roles(id).delete(where);
  }
}
