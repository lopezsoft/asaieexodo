/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.store.general.DimensionesCiclosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId: 'DimensionesCiclosStore',
    requires : [
        'Admin.model.general.CompetenciasModel'
    ],
    model: 'Admin.model.general.CompetenciasModel',
    proxy: {
        extraParams : {
            pdbTable    : 'cdimensiones'
        },
        api: {
            create  : '',
            read    : 'General/get_select',
            update  : 'General/update_data',
            destroy : ''
        }
    }
});

