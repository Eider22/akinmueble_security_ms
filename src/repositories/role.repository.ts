import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Role, RoleRelations, Menu, RoleMenu, User} from '../models';
import {RoleMenuRepository} from './role-menu.repository';
import {MenuRepository} from './menu.repository';
import {UserRepository} from './user.repository';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype._id,
  RoleRelations
> {

  public readonly menus: HasManyThroughRepositoryFactory<Menu, typeof Menu.prototype._id,
          RoleMenu,
          typeof Role.prototype._id
        >;

  public readonly users: HasManyRepositoryFactory<User, typeof Role.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('RoleMenuRepository') protected roleMenuRepositoryGetter: Getter<RoleMenuRepository>, @repository.getter('MenuRepository') protected menuRepositoryGetter: Getter<MenuRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Role, dataSource);
    this.users = this.createHasManyRepositoryFactoryFor('users', userRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
    this.menus = this.createHasManyThroughRepositoryFactoryFor('menus', menuRepositoryGetter, roleMenuRepositoryGetter,);
    this.registerInclusionResolver('menus', this.menus.inclusionResolver);
  }
}
