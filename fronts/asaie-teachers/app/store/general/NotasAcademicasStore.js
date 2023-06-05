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
	    api: {
		    create  : 'academic-notes',
		    read    : 'academic-notes',
		    update  : 'academic-notes',
		    destroy : 'academic-notes'
		}
	}
});
