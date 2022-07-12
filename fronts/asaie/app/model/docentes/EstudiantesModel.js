/**
 * Created by LOPEZSOFT on 29/01/2016.
 */
Ext.define('Admin.model.docentes.EstudiantesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fieldS  : [
        { name : 'id_matric'},
        { name : 'nombres'},
        { name : 'grado'},
        { name : 'grupo'},
        { name : 'sede'},
		{ name : 'id_jorn'},
        { name : 'id_grado'}
    ]
});
