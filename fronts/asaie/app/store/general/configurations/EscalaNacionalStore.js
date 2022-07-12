/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.EscalaNacionalStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'EscalaNacionalStore',
    requires: [
        'Admin.model.general.EscalaNacionalModel'
    ],
    model		: 'Admin.model.general.EscalaNacionalModel',
    proxy: {
        extraParams : {
            pdbTable: 'escala_nacional'
        }
    }
});
