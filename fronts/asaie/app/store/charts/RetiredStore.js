Ext.define('Admin.store.charts.RetiredStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'RetiredStore',
    autoLoad    : true,
    alias       : 'store.RetiredStore',
    requires: [
    	'Admin.model.charts.RegisteredModel'
    ],
    model		: 'Admin.model.charts.RegisteredModel',
    proxy: {
	type	: 'ajax',
	     url:  'school/statistics/retired-by-year'
	}
});
