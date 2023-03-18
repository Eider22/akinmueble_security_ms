import {injectable, /* inject, */ BindingScope} from '@loopback/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');

@injectable({scope: BindingScope.TRANSIENT})
export class SecurityUserService {
  constructor(/* Add @inject to inject parameters */) {}
  
  /**
   * It creates a password with a length of 10 characters and includes numbers
   * @returns A string of 10 characters that includes numbers.
   */
  createPassword(): string {
    // eslint-disable-next-line prefer-const
    let password = generator.generate({
      length: 10,
      numbers: true,
    });
    return password;
  }

 /**
  * It takes a string as an argument and returns a string.
  * @param {string} text - string -&gt; The text that you want to encrypt.
  * @returns the textEncripted variable.
  */
  encriptedText(text: string):string {
    // eslint-disable-next-line prefer-const
    let textEncripted = MD5(text).toString();
    return textEncripted;
  }
}
