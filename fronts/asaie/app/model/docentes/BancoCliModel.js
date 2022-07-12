/**
 * Created by LOPEZSOFT on 16/12/2015.
 */
Ext.define('Admin.model.docentes.BancoCliModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id'},
        { name: 'cons'},
        { name: 'cod_grado'},
        { name: 'id_asig'},
        { name: 'descripcion'},
        { name: 'periodo'},
        { name: 'tipo'},
        { name: 'grado'},
        { name: 'asignatura'}
    ]
});