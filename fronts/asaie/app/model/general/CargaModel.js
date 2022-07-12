/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.CargaModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty : 'id',
    fields: [
        { name: 'id_sede'},
        { name: 'id_grado'},
        { name: 'grupo'},
        { name: 'id_docente'},
        { name: 'porciento'},
        { name: 'id_asig'},
        { name: 'id_jorn'},
        { name: 'year'},
        { name: 'asignatura'},
        { name: 'grado'},
        { name: 'docente'},
        { name: 'sede'},
        { name: 'jornada'},
        { name: 'estado', type : 'bool'}
    ]
});
