/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.CompetenciasStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'CompetenciasStore',
    requires : [
        'Admin.model.general.CompetenciasModel'
    ],
    model: 'Admin.model.general.CompetenciasModel',
    proxy: {
        extraParams : {
            pdbTable : 'competencias'
        }
    }
});

