/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.store.estudiantes.EvaluacionesHistorialEstudiantesStore',{
    extend  : 'Admin.store.base.StoreApi',
    storeId : 'EvaluacionesHistorialEstudiantesStore',
    requires : [
        'Admin.model.estudiantes.EvaluacionesHistorialEstudiantesModel'
    ],
    model   : 'Admin.model.estudiantes.EvaluacionesHistorialEstudiantesModel',
    proxy : {
        extraParams : {
            pdbTable    : 'te_evaluaciones_estudiantes'
        },
        api: {
            create  : '',
            read    : 'students/get_select_evaluaciones_estudiantes',
            update  : 'General/update_data',
            destroy : ''
        }
    }
});