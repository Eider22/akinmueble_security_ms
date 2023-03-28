export namespace SecurityConfiguration {
  export const keyJWT = process.env.KEYJWT;
  export const connectionStringMongoDB = `mongodb+srv://${process.env.USER_MONGODB}:${process.env.PASSWORD_MONGODB}@clusteranki.jakhxmi.mongodb.net/akinmueble_security_msDB?retryWrites=true&w=majority`;

  export const menus = {
    menuUserId: '642258476353cb2d5c653415',
  };
  export const actions = {
    listAction: 'list',
    saveAction: 'save',
    editAction: 'edit',
    removeAction: 'remove',
    downloadAction: 'download',
    assignAction: 'assign',
    upuploadActionload: 'upload',
  };
}
