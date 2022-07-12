/**
 * Created by LOPEZSOFT on 22/01/2016.
 */
Ext.define('Admin.store.docentes.RecuperacionesPeriodicasStore',{
    extend:	'Admin.store.base.StoreApi',
    storeId	: 'RecuperacionesPeriodicasStore',
	pageSize	: 0,
    requires: [
        'Admin.model.docentes.RecuperacionesPeriodicasModel'
    ],
    model		: 'Admin.model.docentes.RecuperacionesPeriodicasModel',
    proxy: {
        api: {
            create  : 'recuperaciones/get_Recuperaciones_b',
            read    : 'recuperaciones/get_Recuperaciones',
            update  : 'recuperaciones/get_Recuperaciones_b',
            destroy : 'recuperaciones/get_Recuperaciones_b'
        }
    }
});
