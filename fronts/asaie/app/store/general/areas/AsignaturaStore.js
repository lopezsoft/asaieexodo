/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.AsignaturaStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AsignaturaStore',
    requires: [
        'Admin.model.general.AsignaturaModel'
    ],
    model		: 'Admin.model.general.AsignaturaModel',
    proxy: {
        extraParams : {
            pdbTable : 'asignaturas'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'academic/get_select_asignaturas',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
