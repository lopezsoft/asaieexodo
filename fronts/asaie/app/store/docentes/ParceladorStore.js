/**
 * Created by LEWIS on 26/11/2015.
 */
Ext.define('Admin.store.docentes.ParceladorStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId	: 'ParceladorStore',
    requires: [
        'Admin.model.docentes.ParceladorModel'
    ],
    model		: 'Admin.model.docentes.ParceladorModel',
    proxy: {
        extraParams : {
            pdbTable : 'parcelador'
        },
        api: {
            create  : 'c_parcelador/get_parcelador_insert',
            read    : 'c_parcelador/get_parcelador',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
