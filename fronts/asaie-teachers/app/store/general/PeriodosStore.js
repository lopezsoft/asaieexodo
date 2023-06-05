Ext.define('Admin.store.general.PeriodosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'PeriodosStore',
    requires: [
    	'Admin.model.general.PeriodosModel'
    ],    
    model		: 'Admin.model.general.PeriodosModel',
    proxy: {
		api: {
			create  : 'crud',
			read    : 'grades/periods',
			update  : 'crud',
			destroy : 'crud'
		},
		extraParams : {
			pdbTable 	: 'periodos_academicos',
			pdbGrado	: 5,
			pdbType		: 1
		}
    }
});
