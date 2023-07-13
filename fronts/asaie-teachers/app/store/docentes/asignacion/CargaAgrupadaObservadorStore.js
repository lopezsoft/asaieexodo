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
		extraParams : {
			type	: 1
		},
        type	: 'ajax',
        url	: 'teachers/grouped-courses'
    }
});
