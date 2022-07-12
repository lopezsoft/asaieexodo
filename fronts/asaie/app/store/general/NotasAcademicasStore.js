Ext.define('Admin.store.general.NotasAcademicasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId	: 'NotasAcademicasStore',
    requires: [
    	'Admin.model.docentes.NotasModel'
    ],
    model		: 'Admin.model.docentes.NotasModel',
    pageSize	: 60,
    autoSync	: false,
    proxy: {
	type	: 'ajax',
	    api: {
		    create  : 'c_notas/get_notas_insert',
		    read    : 'academic/get_notas',
		    update  : 'academic/get_notas_save',
		    destroy : 'c_notas/notas_delete'
		}
	}
});