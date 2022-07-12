/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.inscripciones.TipoFamiliarStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'TipoFamiliarStore',
    pageSize: '20',
    proxy: {
        extraParams: {
            pdbTable: 'family_type'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'General/get_select_all',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    requires: [
        'Admin.model.inscripciones.TipoFamiliarModel'
    ],
    model: 'Admin.model.inscripciones.TipoFamiliarModel'
});