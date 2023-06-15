Ext.define('Admin.store.docentes.CargaStore', {
    extend: 'Admin.store.general.CargaStore',
    storeId : 'CargaStore',
	proxy: {
		extraParams : {
			pdbTable : 'cursos'
		},
		api: {
			create  : 'crud',
			read    : 'teachers/courses',
			update  : 'crud',
			destroy : 'crud'
		}
	}
});

