Ext.define('Admin.store.docentes.NotasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId	: 'NotasStore',
    requires: [
    	'Admin.model.docentes.NotasModel'
    ],
    model		: 'Admin.model.docentes.NotasModel',
    pageSize	: 60,
    autoSync	: false,
    proxy: {
	type	: 'ajax',
	    api: {
		    create  : 'c_notas/get_Notas_insert',
		    read    : 'c_notas/get_Notas',
		    update  : 'c_notas/get_Notas_save',
		    destroy : 'c_notas/get_Notas_delete'
		}
	}
});