/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class NotificationService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SendNotification(data: any, url: string) {
    fetch(url, {
      method: 'post',
      body: JSON.stringify(data),
      headers: {'Content-type': 'application/json'},
    });
  }
}
