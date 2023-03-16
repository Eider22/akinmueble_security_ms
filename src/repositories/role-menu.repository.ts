import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {RoleMenu, RoleMenuRelations} from '../models';

export class RoleMenuRepository extends DefaultCrudRepository<
  RoleMenu,
  typeof RoleMenu.prototype._id,
  RoleMenuRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(RoleMenu, dataSource);
  }
}
