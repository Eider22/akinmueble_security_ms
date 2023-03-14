import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

console.log("el password es: " + process.env.PASSWORD_MONGODB)
const config = {
  name: 'mongodb',
  connector: 'mongodb',
  url: `mongodb+srv://${process.env.USER_MONGODB}:${process.env.PASSWORD_MONGODB}@clusteranki.jakhxmi.mongodb.net/akinmueble_security_ms?retryWrites=true&w=majority`,
  host: 'localhost',
  port: 27017,
  user: '',
  password: '',
  database: 'ms-seguridad',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongodbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongodb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
