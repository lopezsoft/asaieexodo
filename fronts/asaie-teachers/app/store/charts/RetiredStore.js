Ext.define('Admin.store.charts.RetiredStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'RetiredStore',
    autoLoad    : false,
    alias       : 'store.RetiredStore',
    requires: [
    	'Admin.model.charts.RegisteredModel'
    ],
    model		: 'Admin.model.charts.RegisteredModel',
    proxy: {
	type	: 'ajax',
	     url:  'stats/get_retired_year'
	}
});
