Ext.define('Admin.store.charts.RegisteredStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'RegisteredStore',
    autoLoad    : true,
    alias       : 'store.RegisteredStore',
    requires: [
    	'Admin.model.charts.RegisteredModel'
    ],
    model		: 'Admin.model.charts.RegisteredModel',
    proxy: {
	type	: 'ajax',
	     url:  'school/statistics/registered-by-year'
	}
});
