/**
 * Created by LOPEZSOFT on 03/12/2015.
 */
Ext.define('Admin.model.docentes.LogrosModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'id' },
        { name: 'descripcion' },
        { name: 'id_grado' },
        { name: 'id_asig' },
        { name: 'periodo' },
        { name: 'nombre_escala' },
		{ name: 'nombre_proceso' },
        { name: 'estado' },
        { name: 'competencia'},
        { name: 'tipo', type : 'int' },
        { name: 'año' }
    ]
});
