/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.store.convivencia.SituacionesTipoStore',{
    extend      : 'Admin.store.base.StoreApi',
    storeId     : 'SituacionesTipoStore',
    requires    : [
        'Admin.model.convivencia.SituacionesTipoModel'
    ],
    proxy: {
        extraParams : {
            pdbTable    : 'conv_tipo_situaciones'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'c_convivencia/get_select_tipo_situaciones',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    model   : 'Admin.model.convivencia.SituacionesTipoModel'
});