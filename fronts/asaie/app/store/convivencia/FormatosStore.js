/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.store.convivencia.FormatosStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'FormatosStore',
    requires    : [
        'Admin.model.convivencia.FormatosModel'
    ],
    proxy: {
        extraParams : {
            pdbTable    : 'conv_formatos'
        },
        api: {
            create  : 'c_convivencia/insert_formatos',
            read    : 'c_convivencia/get_select_formatos',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    model   : 'Admin.model.convivencia.FormatosModel'
});