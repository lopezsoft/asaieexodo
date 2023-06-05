/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.docentes.ParceladorCliStore', {
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ParceladorCliStore',
	groupField: 'nombre_proceso',
    requires: [
        'Admin.model.docentes.ParceladorCliModel'
    ],
    model : 'Admin.model.docentes.ParceladorCliModel',
    proxy: {
        extraParams : {
            pdbTable : 'parcelador_cli'
        },
        api: {
            create  : 'c_parcelador/insert_parcelador_cli',
            read    : 'c_parcelador/get_select_parcelador_cli',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});
