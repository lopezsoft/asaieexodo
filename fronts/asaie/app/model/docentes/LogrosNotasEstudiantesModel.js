/**
 * Created by LOPEZSOFT on 13/01/2016.
 */
Ext.define('Admin.model.docentes.LogrosNotasEstudiantesModel', {
    extend: 'Admin.model.base.BaseModel',
    idProperty : 'cod_est,id',
    fields: [
        { name: 'id' },
        { name: 'consecutivo' },
        { name: 'descripcion' },
        { name: 'cod_grado' },
        { name: 'id_asig' },
        { name: 'periodo' },
        { name: 'desempeño' },
        { name: 'estado' },
        { name: 'competencia'},
        { name: 'tipo', type : 'int'},
        { name: 'cod_est' },
        { name: 'nombres' },
        { name: 'año' }
    ]
});
