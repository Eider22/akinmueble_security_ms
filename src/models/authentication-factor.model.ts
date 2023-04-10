import {Model, model, property} from '@loopback/repository';

@model()
export class AuthenticationFactor extends Model {
  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  code2fa: string;

  constructor(data?: Partial<AuthenticationFactor>) {
    super(data);
  }
}

export interface AuthenticationFactorRelations {
  // describe navigational properties here
}

export type AuthenticationFactorWithRelations = AuthenticationFactor &
  AuthenticationFactorRelations;
