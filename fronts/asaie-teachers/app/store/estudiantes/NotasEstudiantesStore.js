Ext.define('Admin.store.estudiantes.NotasEstudiantesStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId	: 'NotasEstudiantesStore',
    requires: [
    	'Admin.model.docentes.NotasModel'
    ],
    groupField  : 'periodo',
    model		: 'Admin.model.docentes.NotasModel',
    pageSize	: 60,
    proxy: {
		url	: 'students/get_notas'
	}
});