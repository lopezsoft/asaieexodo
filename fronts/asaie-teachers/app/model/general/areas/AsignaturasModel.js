/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.AsignaturasModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id'},
        { name: 'id_asig' },
		{ name: 'id_grado' },
        { name: 'asignatura' },
        { name: 'descripcion'}
    ]
});
