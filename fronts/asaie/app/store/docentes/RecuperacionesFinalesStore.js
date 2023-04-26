/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.store.docentes.RecuperacionesFinalesStore',{
    extend:	'Admin.store.base.StoreApi',
    storeId	: 'RecuperacionesFinalesStore',
    requires: [
        'Admin.model.docentes.RecuperacionesFinalesModel'
    ],
    model		: 'Admin.model.docentes.RecuperacionesFinalesModel',
    proxy: {
        api: {
            create  : 'recuperaciones/get_recuperaciones_finales_b',
            read    : 'recoveries/type-note',
			// 'recoveries/get_recuperaciones_finales'
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        },
        extraParams : {
            pdbTable    : 'respeciales'
        }
    }
});
