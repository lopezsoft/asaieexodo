/**
 * Created by LOPEZSOFT on 13/02/2016.
 */
Ext.define('Admin.store.promocion.PromovidosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'PromovidosStore',
    pageSize: 0,
    proxy: {
        extraParams : {
            pdbTable : 'promovidos_anticipados'
        },
        api: {
            create  : 'master/insertData',
            read    : 'promotion/advance-promotion',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    },
    requires: [
        'Admin.model.promocion.PromovidosModel'
    ],
    model   : 'Admin.model.promocion.PromovidosModel'
});
