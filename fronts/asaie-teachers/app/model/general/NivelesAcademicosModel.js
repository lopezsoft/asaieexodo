Ext.define('Admin.model.general.NivelesAcademicosModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
    	{ name: 'nombre_nivel' },
		{ name: 'abrev' },
		{ name: 'estado', type : 'bool' }
    ]
});
