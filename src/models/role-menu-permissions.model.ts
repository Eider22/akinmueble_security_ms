import {Model, model, property} from '@loopback/repository';

@model()
export class RoleMenuPermissions extends Model {
  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @property({
    type: 'string',
    required: true,
  })
  idMenu: string;

  @property({
    type: 'string',
    required: true,
  })
  action: string;

  constructor(data?: Partial<RoleMenuPermissions>) {
    super(data);
  }
}

export interface RoleMenuPermissionsRelations {
  // describe navigational properties here
}

export type RoleMenuPermissionsWithRelations = RoleMenuPermissions &
  RoleMenuPermissionsRelations;
