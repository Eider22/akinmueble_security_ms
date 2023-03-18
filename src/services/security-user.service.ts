import {injectable, /* inject, */ BindingScope} from '@loopback/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');

@injectable({scope: BindingScope.TRANSIENT})
export class SecurityUserService {
  constructor(/* Add @inject to inject parameters */) {}
  createPassword(): string {
    // eslint-disable-next-line prefer-const
    let password = generator.generate({
      length: 10,
      numbers: true,
    });
    return password;
  }
  encriptedText(text: string) {
    // eslint-disable-next-line prefer-const
    let textEncripted = MD5(text).toString();
    return textEncripted;
  }
}
