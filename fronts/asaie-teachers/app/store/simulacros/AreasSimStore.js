/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.simulacros.AreasSimStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AreasSimStore',
    requires: [
        'Admin.model.simulacros.AreasSimModel'
    ],
    model		: 'Admin.model.simulacros.AreasSimModel',
    pageSize  : 60,
    proxy: {
        extraParams : {
            pdbTable : 'sm_areas'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});