Ext.define('Admin.store.general.AsignaturasTypeStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AsignaturasTypeStore',
	pageSize: 60,
	requires: [
		'Admin.model.general.AsignaturaModel'
	],
    model		: 'Admin.model.general.AsignaturaModel',
	proxy: {
		extraParams : {
			pdbTable 	: 'asignaturas',
			order  		: '{"asignatura": "ASC"}',
			where		: '{"type": "2"}'
		}
	}
});
