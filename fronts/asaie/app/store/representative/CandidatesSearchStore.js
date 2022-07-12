Ext.define('Admin.store.representative.CandidatesSearchStore',{
    extend  : 'Admin.store.docentes.EstudiantesStore',
    storeId : 'CandidatesSearchStore',
    proxy: {
	    api: {
			create  : 'master/insertData',
			read    : 'representative/getStudents',
			update  : 'master/updateData',
			destroy : 'master/deleteData'
		}
	}
});
