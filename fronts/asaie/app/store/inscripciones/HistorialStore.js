Ext.define('Admin.store.inscripciones.HistorialStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'HistorialStore',
    proxy: {
		extraParams : {
			pdbForce 	: 0,
			pdbTable    : 'student_enrollment'
		},
        api: {
            create  : 'crud',
            read    : 'students/academic-history',
            update  : 'crud',
            destroy : 'crud'
        }
    },
    requires: [
        'Admin.model.inscripciones.HistorialModel'
    ],
    model   : 'Admin.model.inscripciones.HistorialModel'
});
