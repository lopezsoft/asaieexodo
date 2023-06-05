/**
 * Created by LOPEZSOFT on 10/12/2015.
 */
Ext.define('Admin.store.docentes.ParceladorUnidadesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId  : 'ParceladorUnidadesStore',
    requires : [
        'Admin.model.docentes.ParceladorUnidadesModel'
    ],
    model   : 'Admin.model.docentes.ParceladorUnidadesModel',
     proxy: {
         extraParams : {
             pdbTable : 'plarcelador_unidades'
         },
         api  : {
             create  : 'c_parcelador/insert_unidades',
             read    : 'c_parcelador/get_select_unidades',
             update  : 'c_parcelador/get_update_unidades',
             destroy : 'c_parcelador/delete_data'
         }
     }
});