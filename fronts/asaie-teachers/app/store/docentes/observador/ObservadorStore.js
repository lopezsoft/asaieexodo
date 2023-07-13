Ext.define('Admin.store.docentes.observador.ObservadorStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ObservadorStore',
    requires: [
    	'Admin.model.docentes.observador.ObservadorModel'
    ],    
    model		: 'Admin.model.docentes.observador.ObservadorModel',
    proxy: {
        api: {
		    create  : 'crud',
		    read    : 'observer',
		    update  : 'crud',
		    destroy : 'crud'
		}
    }
});
