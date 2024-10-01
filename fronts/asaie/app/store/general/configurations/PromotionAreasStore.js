/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.PromotionAreasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'PromotionAreasStore',
    requires : [
        'Admin.model.general.PromotionAreasModel'
    ],
    model: 'Admin.model.general.PromotionAreasModel',
    proxy: {
        extraParams : {
            pdbTable : 'promotion_areas'
        },
        api: {
			create  : 'crud',
			read    : 'promotion/promotion-areas',
			update  : 'crud',
			destroy : 'crud'
		}
    }
});

