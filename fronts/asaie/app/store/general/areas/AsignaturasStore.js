/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.AsignaturasStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'AsignaturasStore',
    requires: [
        'Admin.model.general.AsignaturasModel'
    ],
    model		: 'Admin.model.general.AsignaturasModel',
    proxy: {
        type	: 'ajax',
        url		: 'c_sql/get_matcursos'
    }
});