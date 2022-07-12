/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.store.convivencia.AccionesStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'AccionesStore',
    requires    : [
        'Admin.model.convivencia.AccionesModel'
    ],
    proxy: {
        extraParams : {
            pdbTable    : 'conv_acciones'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'c_convivencia/get_select_acciones',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    model   : 'Admin.model.convivencia.AccionesModel'
});