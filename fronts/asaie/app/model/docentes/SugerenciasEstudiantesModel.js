/**
 * Created by LOPEZSOFT on 19/01/2016.
 */
Ext.define('Admin.model.docentes.SugerenciasEstudiantesModel', {
    extend: 'Admin.model.base.BaseModel',
    idProperty :'cod_est,id',
    fields: [
        { name: 'id' },
        { name: 'consecutivo' },
        { name: 'sugerencia' },
        { name: 'tipo' },
        { name: 'periodo' }	,
        { name: 'año' },
        { name: 'id_nota'},
        { name: 'id_sugerencia'},
        { name: 'nombres'},
        { name: 'cod_est'}
    ]
});