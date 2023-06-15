/**
 * Created by LOPEZSOFT on 18/01/2016.
 */
Ext.define('Admin.store.docentes.SugerenciasInsertStore', {
    extend	: 'Admin.store.base.StoreApi',
    storeId	: 'SugerenciasInsertStore',
    requires: [
        'Admin.model.docentes.SugerenciasModel'
    ],
    model		: 'Admin.model.docentes.SugerenciasModel',
    proxy: {
		type: 'ajax',
		extraParams : {
			pdbTable    : 'sugerencias'
		},
        api: {
            create  : 'academic-observations/create-for-student',
            read    : 'academic-observations',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
