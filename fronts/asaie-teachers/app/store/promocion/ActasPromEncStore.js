/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.promocion.ActasPromEncStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'ActasPromEncStore',
    requires : [
        'Admin.model.promocion.ActaPromEncModel'
    ],
    model: 'Admin.model.promocion.ActaPromEncModel',
    proxy: {
        extraParams : {
            pdbTable    : 'config_acta_grado'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select',
            update  : 'General/update_data',
            destroy : ''
        }
    }
});

