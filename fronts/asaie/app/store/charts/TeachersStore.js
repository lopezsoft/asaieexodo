Ext.define('Admin.store.charts.TeachersStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'TeachersStore',
    autoLoad    : true,
    alias       : 'store.TeachersStore',
    requires: [
    	'Admin.model.charts.RegisteredModel'
    ],
    model		: 'Admin.model.charts.RegisteredModel',
    proxy: {
	type	: 'ajax',
	     url:  'school/statistics/teachers-by-year'
	}
});
