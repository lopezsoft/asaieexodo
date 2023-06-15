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
		    create  : 'academic-notes/teacher',
		    read    : 'academic-notes/notes-by-course',
		    update  : 'academic-notes/teacher',
		    destroy : 'academic-notes/teacher'
		}
	}
});
