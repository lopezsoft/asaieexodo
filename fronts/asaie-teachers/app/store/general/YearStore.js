Ext.define('Admin.store.general.YearStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'YearStore',
    fields  : [
        {name : 'year'}
    ],
    proxy: {
    	type	: 'ajax',
        url	    : 'General/change_year'
    }
});