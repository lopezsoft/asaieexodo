Ext.define('Admin.store.inscripciones.InscripcionesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'InscripcionesStore',
    proxy: {
        extraParams : {
            pdbTable 	: 'inscripciones',
			order 		: '{"apellido1" : "ASC", "apellido2" : "ASC", "nombre1": "ASC"}'
        },
		api: {
			create  : 'students',
			read    : 'students/index',
			update  : 'crud',
			destroy : 'crud'
		},
    },
    requires: [
        'Admin.model.inscripciones.InscripcionesModel'
    ],
    model   : 'Admin.model.inscripciones.InscripcionesModel'
});
