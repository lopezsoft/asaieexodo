Ext.define('Admin.store.representative.CandidatesSearchStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'CandidatesSearchStore',
	requires    : [
		'Admin.model.docentes.EstudiantesModel'
	],
	model   : 'Admin.model.docentes.EstudiantesModel',
    proxy: {
	    api: {
			create  : 'crud',
			read    : 'students/enrollment-list',
			update  : 'crud',
			destroy : 'crud'
		}
	}
});
