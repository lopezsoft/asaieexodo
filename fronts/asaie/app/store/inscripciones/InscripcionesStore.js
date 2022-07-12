Ext.define('Admin.store.inscripciones.InscripcionesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'InscripcionesStore',
    proxy: {
        extraParams : {
            pdbTable : 'inscripciones'
        },
        api: {
            create  : 'academic/insert_inscripciones',
            read    : 'academic/get_select_inscripciones',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    },
    requires: [
        'Admin.model.inscripciones.InscripcionesModel'
    ],
    model   : 'Admin.model.inscripciones.InscripcionesModel'
});