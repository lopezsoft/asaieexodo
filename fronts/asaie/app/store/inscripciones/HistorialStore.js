/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.inscripciones.HistorialStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'HistorialStore',
    pageSize: '60',
    proxy: {
		extraParams : {
			pdbForce : 0
		},
        api: {
            create  : '',
            read    : 'academic/get_select_historial',
            update  : '',
            destroy : 'academic/get_force_delete_matricula'
        }
    },
    requires: [
        'Admin.model.inscripciones.HistorialModel'
    ],
    model   : 'Admin.model.inscripciones.HistorialModel'
});
