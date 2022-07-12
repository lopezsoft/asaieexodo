Ext.define('Admin.model.general.GradosAgrupadosModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
    	{ name: 'nombre_grado_agrupado' },
		{ name: 'fin_ciclo_escolar', type : 'bool' }
    ]
});
