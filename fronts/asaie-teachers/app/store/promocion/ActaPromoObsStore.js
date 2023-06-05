/**
 * Created by LOPEZSOFT on 13/02/2016.
 */
Ext.define('Admin.store.promocion.ActaPromoObsStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ActaPromoObsStore',
    pageSize: 1,
    proxy: {
        extraParams : {
            pdbTable : 'acta_promocion'
        }
    },
    requires: [
        'Admin.model.promocion.ActaPromocionModel'
    ],
    model   : 'Admin.model.promocion.ActaPromocionModel'
});