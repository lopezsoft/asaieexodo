Ext.define('Admin.store.charts.RegisteredStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'RegisteredStore',
    autoLoad    : false,
    alias       : 'store.RegisteredStore',
    requires: [
    	'Admin.model.charts.RegisteredModel'
    ],
    model		: 'Admin.model.charts.RegisteredModel',
    proxy: {
	type	: 'ajax',
	     url:  'stats/get_Registered_year'
	}
});
