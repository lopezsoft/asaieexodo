/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.ProyCuposStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ProyCuposStore',
    requires: [
        'Admin.model.general.ProyCuposModel'
    ],
    model		: 'Admin.model.general.ProyCuposModel',
    pageSize  : 60,
    proxy: {
        extraParams : {
            pdbTable : 'proyeccion_cupos'
        },
        api: {
            create  : 'General/insert_id',
            read    : 'General/get_select_proycupos',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});