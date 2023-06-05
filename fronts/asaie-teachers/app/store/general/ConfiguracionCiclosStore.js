/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.ConfiguracionCiclosStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ConfiguracionCiclosStore',
    requires: [
        'Admin.model.general.ConfiguracionCiclosModel'
    ],
    model		: 'Admin.model.general.ConfiguracionCiclosModel',
    pageSize    : 60,
    proxy: {
        extraParams : {
            pdbTable : 'config001_ciclos'
        },
        api: {
            create  : '',
            read    : 'General/get_select',
            update  : 'General/update_data',
            destroy : ''
        }
    }
});