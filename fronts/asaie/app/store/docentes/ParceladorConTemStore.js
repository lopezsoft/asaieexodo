/**
 * Created by LOPEZSOFT on 10/12/2015.
 */
Ext.define('Admin.store.docentes.ParceladorConTemStore', {
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ParceladorConTemStore',
    requires: [
        'Admin.model.docentes.ParceladorConTemModel'
    ],
    model   : 'Admin.model.docentes.ParceladorConTemModel',
    proxy: {
        extraParams : {
            pdbTable : 'parcelador_con_tem'
        },
        api : {
            create  : 'c_parcelador/insert_parcelador_cont',
            read    : 'c_parcelador/get_select_parcelador_cont',
            update  : 'c_parcelador/get_update_parcelador_cont',
            destroy : 'General/delete_data'
        }
    }
});