import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  User,
  Role,
} from '../models';
import {UserRepository} from '../repositories';

export class UserRoleController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @get('/users/{id}/role', {
    responses: {
      '200': {
        description: 'Role belonging to User',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Role),
          },
        },
      },
    },
  })
  async getRole(
    @param.path.string('id') id: typeof User.prototype._id,
  ): Promise<Role> {
    return this.userRepository.role(id);
  }
}
