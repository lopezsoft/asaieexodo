/**
 * Created by LOPEZSOFT on 10/12/2015.
 */
Ext.define('Admin.store.docentes.ParceladorItemsConTemStore', {
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'ParceladorItemsConTemStore',
    requires: [
        'Admin.model.docentes.ParceladorItemsConTemModel'
    ],
    model : 'Admin.model.docentes.ParceladorItemsConTemModel',
    proxy : {
        type: 'ajax',
        url : 'c_parcelador/get_select_items_con_tem'
    }
});