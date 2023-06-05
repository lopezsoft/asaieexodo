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
            create  : 'academic-leveling/period/create',
            read    : 'academic-leveling/period/by-teacher',
            update  : 'academic-leveling/period/update',
            destroy : 'academic-leveling/period/destroy'
        }
    }
});
