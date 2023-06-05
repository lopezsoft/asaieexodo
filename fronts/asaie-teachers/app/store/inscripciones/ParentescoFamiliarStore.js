Ext.define('Admin.store.inscripciones.ParentescoFamiliarStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'ParentescoFamiliarStore',
    proxy: {
        extraParams: {
            pdbTable: 'family_relationships'
        }
    },
    requires: [
        'Admin.model.inscripciones.ParentescoFamiliarModel'
    ],
    model: 'Admin.model.inscripciones.ParentescoFamiliarModel'
});
