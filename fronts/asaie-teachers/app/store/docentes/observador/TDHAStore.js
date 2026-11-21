Ext.define('Admin.store.docentes.observador.TDHAStore', {
    extend	: 'Ext.data.Store',
    storeId : 'TDHAStore',
	fields	: [
		{ name: 'tdha'}
	],
	data 	: [
		{
			tdha : "NO APLICA"
		},
		{
			tdha: "SIN DIFICULTAD ESPECÍFICA"
		},
		{
			tdha: "INATENCIÓN PREDOMINANTE"
		},
		{
			tdha: "HIPERACTIVIDAD-IMPULSIVIDAD PREDOMINANTE"
		},
		{
			tdha: "PRESENTACIÓN COMBINADA"
		},
		{
			tdha: "DIFICULTAD PARA MANTENER LA ATENCIÓN"
		},
		{
			tdha: "SE DISTRAE FÁCILMENTE"
		},
		{
			tdha: "DIFICULTAD PARA SEGUIR INSTRUCCIONES"
		},
		{
			tdha: "PROBLEMAS PARA ORGANIZAR TAREAS"
		},
		{
			tdha: "EVITA TAREAS QUE REQUIEREN ESFUERZO MENTAL"
		},
		{
			tdha: "PIERDE OBJETOS CON FRECUENCIA"
		},
		{
			tdha: "INQUIETUD MOTORA / NO PUEDE ESTAR SENTADO"
		},
		{
			tdha: "HABLA EXCESIVAMENTE"
		},
		{
			tdha: "INTERRUMPE A OTROS"
		},
		{
			tdha: "RESPONDE ANTES DE QUE SE TERMINE LA PREGUNTA"
		},
		{
			tdha: "DIFICULTAD PARA ESPERAR SU TURNO"
		}
	],
});
