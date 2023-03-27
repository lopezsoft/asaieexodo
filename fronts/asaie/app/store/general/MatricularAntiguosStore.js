/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.general.MatricularAntiguosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'MatricularAntiguosStore',
    proxy: {
		extraParams : {
			pdbTable : 'student_enrollment',
			promoted : 0,
		},
		api: {
			create  : 'crud',
			read    : 'students/enrollment',
			update  : 'crud',
			destroy : 'crud'
		}
    },
    requires: [
        'Admin.model.inscripciones.MatriculasModel'
    ],
    model   : 'Admin.model.inscripciones.MatriculasModel'
});
