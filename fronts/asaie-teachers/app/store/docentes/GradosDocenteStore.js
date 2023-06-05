/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.store.docentes.GradosDocenteStore', {
    extend: 'Admin.store.base.StoreUrl',
    storeId : 'GradosDocenteStore',
	pageSize: 0,
    requires: [
        'Admin.model.docentes.CargaModel'
    ],
    model		: 'Admin.model.docentes.CargaModel',
    proxy: {
        url	    : 'c_docentes/get_grados_carga'
    }
});
