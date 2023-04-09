import {Model, model, property} from '@loopback/repository';

@model()
export class CredentialsRecoveryPassword extends Model {
  @property({
    type: 'string',
    required: true,
  })
  email: string;


  constructor(data?: Partial<CredentialsRecoveryPassword>) {
    super(data);
  }
}

export interface CredentialsRecoveryPasswordRelations {
  // describe navigational properties here
}

export type CredentialsRecoveryPasswordWithRelations = CredentialsRecoveryPassword & CredentialsRecoveryPasswordRelations;
