Ext.define('Admin.store.docentes.observador.FortDifStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'FortDifStore',
    requires: [
    	'Admin.model.docentes.observador.FortDifModel'
    ],    
    model		: 'Admin.model.docentes.observador.FortDifModel',
    proxy: {
        api: {
		    create  : 'observer/get_fortdif_insert',
		    read    : 'observer/get_fortdif',
		    update  : 'observer/get_fortdif_update',
		    destroy : 'General/delete_data'
		}
    }
});