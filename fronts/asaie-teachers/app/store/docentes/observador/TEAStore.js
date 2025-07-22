Ext.define('Admin.store.docentes.observador.TEAStore', {
    extend	: 'Ext.data.Store',
    storeId : 'TEAStore',
	fields	: [
		{ name: 'tea'}
	],
	data 	: [
		{
			tea : "NO APLICA"
		},
		{
			tea: "SIN DIFICULTAD ESPECÍFICA"
		},
		{
			tea: "DIFICULTAD EN COMUNICACIÓN SOCIAL"
		},
		{
			tea: "DIFICULTAD EN INTERACCIÓN SOCIAL RECÍPROCA"
		},
		{
			tea: "PROBLEMAS EN EL LENGUAJE NO VERBAL"
		},
		{
			tea: "FALTA DE INTERÉS EN COMPARTIR"
		},
		{
			tea: "PATRONES DE COMPORTAMIENTO REPETITIVOS"
		},
		{
			tea: "INTERESES RESTRINGIDOS Y FIJOS"
		},
		{
			tea: "HIPER O HIPO-SENSIBILIDAD A ESTÍMULOS SENSORIALES"
		},
		{
			tea: "DIFICULTAD PARA ADAPTARSE A CAMBIOS"
		},
		{
			tea: "USO RÍGIDO DEL LENGUAJE"
		},
		{
			tea: "DIFICULTAD PARA ESTABLECER RELACIONES"
		},
		{
			tea: "MOVIMIENTOS ESTEREOTIPADOS"
		}
	],
});
