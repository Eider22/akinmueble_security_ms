export namespace SecurityConfiguration {
  export const keyJWT = process.env.KEYJWT;
  export const connectionStringMongoDB = `mongodb+srv://${process.env.USER_MONGODB}:${process.env.PASSWORD_MONGODB}@clusteranki.jakhxmi.mongodb.net/akinmueble_security_msDB?retryWrites=true&w=majority`;

  export const menus = {
    menuUserId: '642d9e2202e1597baa66e446',
    menuRequestId: '642dac7af2ddcaa94e8888bd',
  };
  export const actions = {
    listAction: 'list',
    createAction: 'create',
    editAction: 'edit',
    deleteAction: 'del',
    downloadAction: 'download',
    assignAction: 'assign',
    upuploadActionload: 'upload',
  };
  export const roleIds = {
    advisor: '642d9ecb02e1597baa66e448',
    admin: '64225720d8b31f3e70717387',
    customer: '642d9eb902e1597baa66e447',
  };
}
