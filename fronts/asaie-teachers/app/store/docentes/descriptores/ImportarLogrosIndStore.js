/**
 * Created by LOPEZSOFT on 2/01/2016.
 */
Ext.define('Admin.store.docentes.ImportarLogrosIndStore', {
    extend  : 'Admin.store.base.StoreUrl',
    storeId : 'ImportarLogrosIndStore',
    requires: [
        'Admin.model.docentes.ParceladorCliModel'
    ],

    model : 'Admin.model.docentes.ParceladorCliModel',

    proxy: {
        extraParams : {
            pdbTable : 'parcelador_cli'
        },
        url : 'c_parcelador/get_importar_logros_ind'
    }
});