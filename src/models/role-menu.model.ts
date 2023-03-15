import {Entity, model, property} from '@loopback/repository';

@model()
export class RoleMenu extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  create: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  list: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  edit: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  remove: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  assign: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  download: boolean;


  constructor(data?: Partial<RoleMenu>) {
    super(data);
  }
}

export interface RoleMenuRelations {
  // describe navigational properties here
}

export type RoleMenuWithRelations = RoleMenu & RoleMenuRelations;
