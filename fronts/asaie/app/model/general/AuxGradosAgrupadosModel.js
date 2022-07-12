Ext.define('Admin.model.general.AuxGradosAgrupadosModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
		{ name: 'id_grado_agrupado'},
		{ name: 'id_grado'},
    	{ name: 'nombre_grado_agrupado' },
		{ name: 'grado' }
    ]
});
