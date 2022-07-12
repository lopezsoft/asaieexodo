/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.inscripciones.ParentescoFamiliarStore',{
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'ParentescoFamiliarStore',
    pageSize: '20',
    proxy: {
        extraParams: {
            pdbTable: 'family_relationships'
        },
        api: {
            create: 'General/insert_data',
            read: 'General/get_select_all',
            update: 'General/update_data',
            destroy: 'General/delete_data'
        }
    },
    requires: [
        'Admin.model.inscripciones.ParentescoFamiliarModel'
    ],
    model: 'Admin.model.inscripciones.ParentescoFamiliarModel'
});