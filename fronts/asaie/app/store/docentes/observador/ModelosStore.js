Ext.define('Admin.store.docentes.observador.ModelosStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'ModelosStore',
    requires: [
    	'Admin.model.docentes.observador.ModelosModel'
    ],    
    model		: 'Admin.model.docentes.observador.ModelosModel',
    proxy: {
        url		: 'observer/get_modelo_observador'	
    }
});