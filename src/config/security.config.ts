export namespace SecurityConfiguration {
  export const keyJWT = process.env.KEYJWT;
  export const connectionStringMongoDB = `mongodb+srv://${process.env.USER_MONGODB}:${process.env.PASSWORD_MONGODB}@clusteranki.jakhxmi.mongodb.net/akinmueble_security_msDB?retryWrites=true&w=majority`;

  export const menus = {
    menuUserId: '642dabf1f2ddcaa94e8888bc',
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
}
