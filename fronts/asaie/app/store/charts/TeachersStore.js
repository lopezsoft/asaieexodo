Ext.define('Admin.store.charts.TeachersStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'TeachersStore',
    autoLoad    : false,
    alias       : 'store.TeachersStore',
    requires: [
    	'Admin.model.charts.RegisteredModel'
    ],
    model		: 'Admin.model.charts.RegisteredModel',
    proxy: {
	type	: 'ajax',
	     url:  'stats/get_teachers_year'
	}
});
