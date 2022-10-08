Ext.define('Admin.store.inscripciones.InscripcionesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'InscripcionesStore',
    proxy: {
        extraParams : {
            pdbTable 	: 'inscripciones',
			order 		: '{"apellido1" : "ASC", "apellido2" : "ASC", "nombre1": "ASC"}'
        }
    },
    requires: [
        'Admin.model.inscripciones.InscripcionesModel'
    ],
    model   : 'Admin.model.inscripciones.InscripcionesModel'
});
