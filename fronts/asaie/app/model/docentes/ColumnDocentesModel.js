Ext.define('Admin.model.docentes.ColumnDocentesModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
		{ name: 'id', type : 'int'},
		{ name: 'id_curso' },
		{ name: 'activa', type: 'bool'},
		{ name: 'nombre' },
		{ name: 'name_column' },
		{ name: 'porcentual', type	: 'float'},
		{ name: 'evaluacion', type: 'bool'},
		{ name: 'foro', type: 'bool'},
		{ name: 'id_evaluacion', type: 'int'},
		{ name: 'id_competencia', type: 'int'},
		{ name: 'id_foro', type: 'int'},
		{ name: 'modificable', type: 'int'},
		{ name: 'grupo' }
   	 ]
});

