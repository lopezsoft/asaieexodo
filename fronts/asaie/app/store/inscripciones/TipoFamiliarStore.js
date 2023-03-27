/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.store.inscripciones.TipoFamiliarStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'TipoFamiliarStore',
    proxy: {
        extraParams: {
            pdbTable: 'family_type'
        }
    },
    requires: [
        'Admin.model.inscripciones.TipoFamiliarModel'
    ],
    model: 'Admin.model.inscripciones.TipoFamiliarModel'
});
