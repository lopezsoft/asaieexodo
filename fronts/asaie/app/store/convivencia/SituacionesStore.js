/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.store.convivencia.SituacionesStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'SituacionesStore',
    pageSize    : 200,
    requires    : [
        'Admin.model.convivencia.SituacionesModel'
    ],
    proxy: {
        extraParams : {
            pdbTable    : 'conv_situaciones',
            pdbType     : 0
        },
        api: {
            create  : 'General/insert_data',
            read    : 'c_convivencia/get_select_situaciones',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    model   : 'Admin.model.convivencia.SituacionesModel'
});