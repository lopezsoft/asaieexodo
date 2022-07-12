/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.store.general.AreasAsignaturaYearStore', {
    extend: 'Admin.store.base.StoreApi',
    storeId : 'AreasAsignaturaYearStore',
    requires: [
        'Admin.model.general.AreasAsignaturaModel'
    ],
    model		: 'Admin.model.general.AreasAsignaturaModel',
    proxy: {
        extraParams : {
            pdbTable : 'aux_asignaturas'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'academic/get_select_asignaturas_year',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    }
});