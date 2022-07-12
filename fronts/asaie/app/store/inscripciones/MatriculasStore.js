/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.inscripciones.MatriculasStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'MatriculasStore',
    pageSize: '20',
    proxy: {
        extraParams : {
            pdbTable : 'student_enrollment'
        },
        api: {
            create  : 'master/insertData',
            read    : 'academic/get_select_matriculas',
            update  : 'master/updateData',
            destroy : 'master/deleteData'
        }
    },
    requires: [
        'Admin.model.inscripciones.MatriculasModel'
    ],
    model   : 'Admin.model.inscripciones.MatriculasModel'
});