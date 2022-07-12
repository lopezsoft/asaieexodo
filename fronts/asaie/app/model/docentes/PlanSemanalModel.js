/**
 * Created by LOPEZSOFT on 14/12/2015.
 */
Ext.define('Admin.model.docentes.PlanSemanalModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id'},
        { name: 'cod_grado'},
        { name: 'id_asig'},
        { name: 'periodo'},
        { name: 'año'},
        { name: 'temas'},
        { name: 'indicadores'},
        { name: 'actividades'},
        { name: 'fecha_inicio'},
        { name: 'fecha_final'},
        { name: 'revisado'}
    ]
});