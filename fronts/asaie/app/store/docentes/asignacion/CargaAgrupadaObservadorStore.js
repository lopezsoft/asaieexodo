/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.store.docentes.CargaAgrupadaObservadorStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'CargaAgrupadaObservadorStore',
    requires: [
        'Admin.model.docentes.CargaModel'
    ],
    model		: 'Admin.model.docentes.CargaModel',
    proxy: {
        type	: 'ajax',
        url	: 'c_sql/get_carga_academica_agrupada_observador'
    }
});