/**
 * Created by LOPEZSOFT on 18/01/2016.
 */
Ext.define('Admin.store.docentes.SugerenciasInsertStore', {
    extend	: 'Admin.store.base.StoreApi',
    storeId	: 'SugerenciasInsertStore',
    requires: [
        'Admin.model.docentes.SugerenciasModel'
    ],
    model		: 'Admin.model.docentes.SugerenciasModel',
    proxy: {
        api: {
            create  : 'c_sugerencias/insert_sugerencias_est',
            read    : 'c_sugerencias/get_sugerencias',
            update  : 'c_sugerencias/get_update_sugerencias',
            destroy : 'master/deleteData'
        }
    }
});