/**
 * Created by LOPEZSOFT on 13/02/2016.
 */
Ext.define('Admin.store.general.MatriculadosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'MatriculadosStore',
    pageSize: 100,
    proxy: {
        extraParams : {
            pdbTable : 'student_enrollment'
        },
        api: {
            create  : '',
            read    : 'General/get_select_matriculados',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    requires: [
        'Admin.model.inscripciones.MatriculasModel'
    ],
    model   : 'Admin.model.inscripciones.MatriculasModel'
});