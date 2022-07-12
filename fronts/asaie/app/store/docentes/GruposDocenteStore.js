/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.store.docentes.GruposDocenteStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'GruposDocenteStore',
    requires: [
        'Admin.model.docentes.CargaModel'
    ],
    model		: 'Admin.model.docentes.CargaModel',
    proxy: {
        url	    : 'c_docentes/get_grupos_carga'
    }
});