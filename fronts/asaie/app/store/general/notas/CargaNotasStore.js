/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.CargaNotasStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'CargaNotasStore',
    requires: [
        'Admin.model.general.CargaModel'
    ],
    model		: 'Admin.model.general.CargaModel',
    pageSize  : 60,
    proxy: {
        url  : 'academic-notes/academic-notes'
    }
});
