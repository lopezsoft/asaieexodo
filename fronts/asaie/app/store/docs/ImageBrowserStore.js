Ext.define('Admin.store.docs.ImageBrowserStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ImageBrowserStore',
    requires: [
    	'Admin.model.docs.ImageBrowserModel'
    ],    
    model		: 'Admin.model.docs.ImageBrowserModel',
    pageSize	: 0,
    proxy: {
        api: {
		    create  : '',
		    read    : '',
		    update  : '',
		    destroy : 'reports/delete_file'
		}
    }
});
