Ext.define('Admin.store.docentes.observador.AnotacionesM3Store', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AnotacionesM3Store',
    pageSize: 60,
    requires: [
    	'Admin.model.docentes.observador.AnotacionesM3Model'
    ],    
    model		: 'Admin.model.docentes.observador.AnotacionesM3Model',
    proxy: {
        extraParams  : {
            pdbTable    : 'obs_anotaciones_mod_3'
        },
		api: {
			create  : 'observer/annotations',
			read    : 'crud',
			update  : 'crud',
			destroy : 'crud'
		}
    }
});
