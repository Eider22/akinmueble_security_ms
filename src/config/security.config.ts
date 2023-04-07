export namespace SecurityConfiguration {
  export const keyJWT = process.env.KEYJWT;
  export const connectionStringMongoDB = `mongodb+srv://${process.env.USER_MONGODB}:${process.env.PASSWORD_MONGODB}@clusteranki.jakhxmi.mongodb.net/akinmueble_security_msDB?retryWrites=true&w=majority`;

  export const menus = {
    menuUserId: '642d9e2202e1597baa66e446',
    menuRequestId: '642d9e0d02e1597baa66e445',
  };
  export const actions = {
    listAction: 'list',
    createAction: 'create',
    editAction: 'edit',
    removeAction: 'remove',
    downloadAction: 'download',
    assignAction: 'assign',
    upuploadActionload: 'upload',
  };
}
