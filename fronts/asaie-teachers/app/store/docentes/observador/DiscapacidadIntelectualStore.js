Ext.define('Admin.store.docentes.observador.DiscapacidadIntelectualStore', {
    extend	: 'Ext.data.Store',
    storeId : 'DiscapacidadIntelectualStore',
	fields	: [
		{ name: 'disc_intelectual'}
	],
	data 	: [
		{
			disc_intelectual : "NO APLICA"
		},
		{
			disc_intelectual : "SIN DIFICULTAD ESPECÍFICA"
		},
		{
			disc_intelectual : "LEVE"
		},
		{
			disc_intelectual : "MODERADA"
		},
		{
			disc_intelectual : "GRAVE"
		},
		{
			disc_intelectual : "PROFUNDA"
		},
		{
			disc_intelectual : "DIFICULTAD EN HABILIDADES CONCEPTUALES"
		},
		{
			disc_intelectual : "DIFICULTAD EN HABILIDADES SOCIALES"
		},
		{
			disc_intelectual : "DIFICULTAD EN HABILIDADES PRÁCTICAS"
		},
		{
			disc_intelectual : "REQUIERE APOYO INTERMITENTE"
		},
		{
			disc_intelectual : "REQUIERE APOYO LIMITADO"
		},
		{
			disc_intelectual : "REQUIERE APOYO EXTENSO"
		},
		{
			disc_intelectual : "REQUIERE APOYO GENERALIZADO"
		}
	],
});
