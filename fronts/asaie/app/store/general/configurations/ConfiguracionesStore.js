/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.ConfiguracionesStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'ConfiguracionesStore',
    requires: [
        'Admin.model.general.ConfiguracionesModel'
    ],
    model		: 'Admin.model.general.ConfiguracionesModel',
    pageSize    : 10,
    proxy: {
        extraParams : {
            pdbTable : 'config001'
        },
        api: {
            create  : 'master/insertData',
            read    : 'master/getGeneralConfig',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    }
});
