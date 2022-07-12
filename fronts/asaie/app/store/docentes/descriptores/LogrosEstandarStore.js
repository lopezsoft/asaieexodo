/**
 * Created by LOPEZSOFT on 11/01/2016.
 */
Ext.define('Admin.store.docentes.LogrosEstandarStore',{
    extend: 'Admin.store.base.StoreApi',
    storeId : 'LogrosEstandarStore',
    requires : [
        'Admin.model.docentes.LogrosEstandarModel'
    ],
    model   : 'Admin.model.docentes.LogrosEstandarModel',
    proxy   : {
        api     : {
            create  : 'c_notas/get_logro_estandares_save',
            read    : 'c_notas/get_logro_estandares_save',
            update  : 'c_notas/get_logro_estandares_save',
            destroy : 'c_notas/get_logro_estandares_save'
        }
    }
});