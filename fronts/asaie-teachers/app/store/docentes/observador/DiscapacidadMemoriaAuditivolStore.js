Ext.define('Admin.store.docentes.observador.DiscapacidadMemoriaAuditivoStore', {
    extend	: 'Ext.data.Store',
    storeId : 'DiscapacidadMemoriaAuditivoStore',
	fields	: [
		{ name: 'disc_memoria_auditivo'}
	],
	data 	: [
		{
			disc_memoria_auditivo : "NO APLICA"
		},
		{
			disc_memoria_auditivo: "SIN DIFICULTAD ESPECÍFICA"
		},
		{
			disc_memoria_auditivo: "DIFICULTAD PARA RECORDAR INSTRUCCIONES VERBALES"
		},
		{
			disc_memoria_auditivo: "DIFICULTAD PARA SEGUIR SECUENCIAS VERBALES"
		},
		{
			disc_memoria_auditivo: "PROBLEMAS PARA RECORDAR NOMBRES"
		},
		{
			disc_memoria_auditivo: "DIFICULTAD PARA RECORDAR HECHOS ESPECÍFICOS"
		},
		{
			disc_memoria_auditivo: "OLVIDO FRECUENTE DE INFORMACIÓN RECIENTE"
		},
		{
			disc_memoria_auditivo: "DIFICULTAD PARA ORGANIZAR LA INFORMACIÓN AUDITIVA"
		},
		{
			disc_memoria_auditivo: "PROBLEMAS PARA DISCERNIR SONIDOS DEL AMBIENTE"
		},
		{
			disc_memoria_auditivo: "DIFICULTAD PARA IDENTIFICAR SONIDOS DEL LENGUAJE"
		},
		{
			disc_memoria_auditivo: "LENTITUD EN EL PROCESAMIENTO DE INFORMACIÓN HABLADA"
		},
		{
			disc_memoria_auditivo: "PROBLEMAS CON LA MEMORIA DE TRABAJO AUDITIVA"
		},
		{
			disc_memoria_auditivo: "DIFICULTAD PARA EXTRAER EL SIGNIFICADO DE LO ESCUCHADO"
		}
	],
});
