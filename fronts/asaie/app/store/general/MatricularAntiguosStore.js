/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.general.MatricularAntiguosStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'MatricularAntiguosStore',
    proxy: {
        extraParams : {
            pdbTable : 'matriculas'
        },
        api: {
            create  : 'General/insert_data',
            read    : 'academic/get_select_matriculas',
            update  : 'General/update_data',
            destroy : 'General/delete_data'
        }
    },
    requires: [
        'Admin.model.inscripciones.MatriculasModel'
    ],
    model   : 'Admin.model.inscripciones.MatriculasModel'
});
