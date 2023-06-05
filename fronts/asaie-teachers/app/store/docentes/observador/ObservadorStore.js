Ext.define('Admin.store.docentes.observador.ObservadorStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ObservadorStore',
    requires: [
    	'Admin.model.docentes.observador.ObservadorModel'
    ],    
    model		: 'Admin.model.docentes.observador.ObservadorModel',
    proxy: {
        api: {
		    create  : 'master/insertData',
		    read    : 'observer/get_observador',
		    update  : 'master/updateData',
		    destroy : 'master/deleteData'
		}
    }
});