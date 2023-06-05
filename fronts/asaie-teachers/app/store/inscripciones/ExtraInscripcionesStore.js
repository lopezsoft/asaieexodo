Ext.define('Admin.store.inscripciones.ExtraInscripcionesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ExtraInscripcionesStore',
    proxy: {
        extraParams : {
            pdbTable : 'extra_inscripciones'
        }
    },
    requires: [
        'Admin.model.inscripciones.InscripcionesModel'
    ],
    model   : 'Admin.model.inscripciones.InscripcionesModel'
});