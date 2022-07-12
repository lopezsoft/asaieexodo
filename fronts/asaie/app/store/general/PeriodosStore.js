Ext.define('Admin.store.general.PeriodosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'PeriodosStore',
    requires: [
    	'Admin.model.general.PeriodosModel'
    ],    
    model		: 'Admin.model.general.PeriodosModel',
    proxy: {
		api: {
			create  : 'master/insertData',
			read    : 'c_sql/get_periodos',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		},
		extraParams : {
			pdbTable 	: 'periodos_academicos',
			pdbGrado	: 5,
			pdbType		: 1
		}
    }
});
