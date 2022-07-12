/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.store.docentes.AusenciasStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'AusenciasStore',
    requires : [
        'Admin.model.docentes.AusenciasModel'
    ],

    model   : 'Admin.model.docentes.AusenciasModel',

    proxy : {
        extraParams : {
            pdbTable    : 'ausencias'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'c_notas/get_select_ausencias',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});