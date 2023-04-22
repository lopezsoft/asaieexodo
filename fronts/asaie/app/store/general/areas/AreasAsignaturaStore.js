/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.AreasAsignaturaStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AreasAsignaturaStore',
    requires: [
        'Admin.model.general.AreasAsignaturaModel'
    ],
    model		: 'Admin.model.general.AreasAsignaturaModel',
    proxy: {
        extraParams : {
            pdbTable : 'aux_asignaturas'
        },
        api: {
            create  : 'subject/auxiliar-subjects',
            read    : 'subject/auxiliar-subjects',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
