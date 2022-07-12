/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.AreasAsignaturaModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id_asign'},
        { name: 'id_area'},
        { name: 'areas' },
        { name: 'year', type : 'int' },
        { name: 'activa', type : 'bool'},
        { name: 'asignatura' }
    ]
});