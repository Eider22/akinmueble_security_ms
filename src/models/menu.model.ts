import {Entity, model, property, hasMany} from '@loopback/repository';
import {Role} from './role.model';
import {RoleMenu} from './role-menu.model';

@model()
export class Menu extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  comment?: string;

  @hasMany(() => Role, {through: {model: () => RoleMenu}})
  roles: Role[];

  constructor(data?: Partial<Menu>) {
    super(data);
  }
}

export interface MenuRelations {
  // describe navigational properties here
}

export type MenuWithRelations = Menu & MenuRelations;
