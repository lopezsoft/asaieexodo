Ext.define('Admin.store.general.ProyTransvImageBrowserStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ProyTransvImageBrowserStore',
    requires: [
    	'Admin.model.docs.ImageBrowserModel'
    ],    
    model		: 'Admin.model.docs.ImageBrowserModel',
    pageSize	: 0,
    proxy: {
        api: {
		    create  : '',
		    read    : 'General/read_images_proy',
		    update  : '',
		    destroy : 'reports/delete_file'
		}
    }
});