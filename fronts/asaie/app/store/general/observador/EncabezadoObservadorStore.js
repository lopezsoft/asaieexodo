/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.EncabezadoObservadorStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'EncabezadoObservadorStore',
    requires: [
        'Admin.model.general.EncabezadoObservadorModel'
    ],
    model		: 'Admin.model.general.EncabezadoObservadorModel',
    proxy: {
        extraParams : {
            pdbTable : 'obs_modelos_observador_cuerpo'
        }
    }
});