/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.store.inscripciones.MatriculasStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'MatriculasStore',
    proxy: {
        extraParams : {
            pdbTable : 'student_enrollment'
        }
    },
    requires: [
        'Admin.model.inscripciones.MatriculasModel'
    ],
    model   : 'Admin.model.inscripciones.MatriculasModel'
});
