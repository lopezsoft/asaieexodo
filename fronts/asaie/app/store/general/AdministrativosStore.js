Ext.define('Admin.store.general.AdministrativosStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'AdministrativosStore',
    requires: [
    	'Admin.model.general.AdministrativosModel'
    ],
    model		: 'Admin.model.general.AdministrativosModel',
    proxy: {
	type	: 'ajax',
	     url:  'General/get_select_administrativos'
	}
});