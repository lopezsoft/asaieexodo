/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.store.docentes.CargaAgrupadaStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'CargaAgrupadaStore',
    requires: [
        'Admin.model.docentes.CargaModel'
    ],
    model		: 'Admin.model.docentes.CargaModel',
    proxy: {
        type	: 'ajax',
        url		: 'teachers/grouped-courses',
    }
});
