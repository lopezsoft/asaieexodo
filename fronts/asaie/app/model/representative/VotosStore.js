/**
 * Created by LOPEZSOFT on 19/02/2016.
 */
Ext.define('Admin.store.representative.VotosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'VotosStore',
    fields  : [
        { name  : 'id_matric'},
        { name  : 'id_candidato'}
    ],
    proxy   : {
        api : {
            create  : 'representative/insert_votos'
        }
    }
});
