/**
 * Created by LOPEZSOFT on 13/02/2016.
 */
Ext.define('Admin.store.promocion.ListaMatriculaStore',{
    extend  : 'Admin.store.general.MatriculadosStore',
    storeId : 'ListaMatriculaStore',
    pageSize: 100,
    proxy: {
		extraParams : {
			pdbTable : 'student_enrollment'
		},
		api: {
			create  : 'crud',
			read    : 'students/enrollment-list',
			update  : 'crud',
			destroy : 'crud'
		}
	},
    requires: [
        'Admin.model.inscripciones.MatriculasModel'
    ],
    model   : 'Admin.model.inscripciones.MatriculasModel'
});
