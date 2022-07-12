/**
 * Created by LOPEZSOFT on 19/01/2016.
 */
Ext.define('Admin.store.docentes.SugerenciasEstudiantesStore', {
    extend	: 'Admin.store.base.StoreApi',
    storeId	: 'SugerenciasEstudiantesStore',
    groupField  : 'nombres',
    pageSize	: 2000,
    requires: [
        'Admin.model.docentes.SugerenciasEstudiantesModel'
    ],
    model		: 'Admin.model.docentes.SugerenciasEstudiantesModel',
    proxy: {
        extraParams : {
            pdbTable    : 'sugerencias'
        },
        api: {
            create  : 'c_sugerencias/get_select_estudiantes',
            read    : 'c_sugerencias/get_select_estudiantes',
            update  : 'c_sugerencias/get_select_estudiantes',
            destroy : 'c_sugerencias/get_delete_estudiantes'
        }
    }
});