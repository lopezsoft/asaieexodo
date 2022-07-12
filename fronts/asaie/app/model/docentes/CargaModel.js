Ext.define('Admin.model.docentes.CargaModel', {
    extend: 'Admin.model.base.BaseModel',
    fields: [
		{ name: 'id_grado' },
		{ name: 'grado' },
		{ name: 'grupo' },
		{ name: 'id_asig' },
		{ name: 'asignatura' },
		{ name: 'cod_jorn' },
		{ name: 'jornada' },
		{ name: 'id_sede' },
		{ name: 'sede' },
		{ name: 'año' }
	 ]
});
