/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.store.docentes.AsigaturasGradoDocenteStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'AsigaturasGradoDocenteStore',
	pageSize: 0,
    requires: [
        'Admin.model.docentes.CargaModel'
    ],
    model		: 'Admin.model.docentes.CargaModel',
    proxy: {
        url	    : 'c_docentes/get_asig_grado_carga'
    }
});
