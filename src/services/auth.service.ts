import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {RoleMenuRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    @repository(RoleMenuRepository)
    private rolMenuRepository: RoleMenuRepository,
  ) {}

  async verifiacatePermitsUserByRol(
    roleId: string,
    menuId: string,
    action: string,
  ): Promise<UserProfile | undefined> {
    let permit = await this.rolMenuRepository.findOne({
      where: {
        roleId,
        menuId,
      },
    });

    if (!permit) {
      throw new HttpErrors[401](
        'No es posible ejecutar la acción por falta de permisos',
      );
    }

    let coninue: boolean = false;
    switch (action) {
      case 'create':
        coninue = permit.create;
        break;
      case 'edit':
        coninue = permit.edit;
        break;
      case 'list':
        coninue = permit.list;
        break;
      case 'remove':
        coninue = permit.remove;
        break;
      case 'assign':
        coninue = permit.assign;
        break;
      case 'download':
        coninue = permit.download;
        break;
      case 'upload':
        coninue = permit.upload;
        break;
      default:
        throw new HttpErrors[400](
          'No es posible ejecutar la acción porque esta no existe',
        );
    }

    if (!coninue) {
      return undefined;
    }

    let profile: UserProfile = Object.assign({
      authorized: 'ok',
    });

    return profile;
  }
}
