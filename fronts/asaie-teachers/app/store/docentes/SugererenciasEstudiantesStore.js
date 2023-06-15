/**
 * Created by LOPEZSOFT on 19/01/2016.
 */
Ext.define('Admin.store.docentes.SugerenciasEstudiantesStore', {
    extend	: 'Admin.store.base.StoreApi',
    storeId	: 'SugerenciasEstudiantesStore',
    groupField  : 'nombres',
    pageSize	: 0,
    requires: [
        'Admin.model.docentes.SugerenciasEstudiantesModel'
    ],
    model		: 'Admin.model.docentes.SugerenciasEstudiantesModel',
    proxy: {
        extraParams : {
            pdbTable    : 'sugerencias'
        },
        api: {
            create  : 'crud',
            read    : 'academic-observations/by-students',
            update  : 'crud',
            destroy : 'crud'
        }
    }
});
