Ext.define('Admin.store.general.DocentesStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	    : 'DocentesStore',
    requires: [
    	'Admin.model.general.DocentesModel'
    ],
    model		: 'Admin.model.general.DocentesModel',
    proxy: {
	type	: 'ajax',
	     url:  'General/get_select_docentes'
	}
});