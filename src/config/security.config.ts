export namespace SecurityConfiguration {
  export const keyJWT: string = process.env.KEY_JWT!;
  export const connectionStringMongoDB = `mongodb+srv://${process.env.USER_MONGODB}:${process.env.PASSWORD_MONGODB}@clusteranki.jakhxmi.mongodb.net/akinmueble_security_msDB?retryWrites=true&w=majority`;
}
