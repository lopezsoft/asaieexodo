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
            create  : 'crud',
            read    : 'promotion/final-leveling',
            update  : 'crud',
            destroy : 'crud'
        },
        extraParams : {
            pdbTable    : 'respeciales'
        }
    }
});
