/**
 * Created by LOPEZSOFT on 13/02/2016.
 */
Ext.define('Admin.store.promocion.PromotedObservationStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'PromotedObservationStore',
    pageSize: 1,
    proxy: {
        extraParams : {
            pdbTable : 'promoted_observation'
        }
    },
    requires: [
        'Admin.model.promocion.PromovidosDetalleModel'
    ],
    model   : 'Admin.model.promocion.PromovidosDetalleModel'
});
