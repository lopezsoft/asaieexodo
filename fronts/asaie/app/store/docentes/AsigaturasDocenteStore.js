/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.store.docentes.AsigaturasDocenteStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'AsigaturasDocenteStore',
    requires: [
        'Admin.model.docentes.CargaModel'
    ],
    model		: 'Admin.model.docentes.CargaModel',
    proxy: {
        url	    : 'c_docentes/get_asig_grados_grupos_carga'
    }
});