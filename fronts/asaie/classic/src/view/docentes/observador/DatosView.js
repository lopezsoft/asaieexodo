Ext.define('Admin.view.docentes.observador.DatosView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.DatosView',
	maximized	: true,
	controller	: 'observador',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'TextField',
			items	: [
				{
					name: 'vision',
					fieldLabel: 'Visión:',
					flex: 3
				},
				{
					name: 'audicion',
					fieldLabel: 'Audición:',
					flex: 3
				},
	            {
					name: 'limit_fisicas',
					fieldLabel: 'Limitaciones físicas:',
					flex: 3
				},
				{
					name: 'enfer_recurentes',
					fieldLabel: 'Enfermedad(es) recurente(s):',
					flex: 3
	            },
	            {
					name: 'comp_academico',
					fieldLabel: 'Compromiso académico pendiente:',
					flex: 3
				},
				{
					name: 'comp_disciplinario',
					fieldLabel: 'Compromiso disciplinario pendiente:',
					flex: 3
	            },
				{
					name		: 'vive_con',
					fieldLabel	: 'Vive con su(s):',
					flex		: 1
				},
				{
					xtype		: 'customnumberfield',
					name		: 'numero_hnos',
					fieldLabel	: 'Número de Hnos:',
					flex		: 1
				},
				{
					xtype		: 'customnumberfield',
					name		: 'lugar_hnos',
					fieldLabel	: 'Lugar que ocupa:',
					flex		: 1
				},
				{
					xtype		: 'customnumberfield',
					name		: 'hnos_bachilleres',
					fieldLabel	: 'Hnos bachilleres:',
					flex		: 1,
					emptyText	: 'Cantidad'
				},
				{
					xtype		: 'customnumberfield',
					name		: 'n_personas_vive',
					fieldLabel	: 'Personas con quien vive:',
					flex		: 2,
					emptyText	: 'Cantidad'
	            },
	            {
	            	xtype 	: 'fieldset',
	            	items	: [
	            		{	            	
							xtype		: 'fieldcontainer',
							fieldLabel 	: 'RELACIONES CON',
		                    layout		: 'vbox',
		                    defaultType	: 'CbSituacion',
							defaults	: {
								flex	: 1,
								labelWidth	: 120
							},
		                    items: [
			                    {
			                        name		: 'relacion_madre',
			                        fieldLabel	: 'Madre :',
			                        itemId		: 'cbMadre'
			                    },
			                    {
			                        name		: 'relacion_padre',
			                        fieldLabel	: 'Padre :',
			                        itemId		: 'cbPadre'
			                    },
			                    {
			                        name		: 'relacion_hnos',
			                        fieldLabel	: 'Hermanos :',
			                        itemId		: 'cbHermanos'
			                    }
			                ]
			            }
			        ]
				},
				{
					name		: 'dis_aprox_col',
					fieldLabel	: 'Distancia aproximada al Colegio:',
					flex		: 1
				},
				{
					name		: 'tiempo_llegada_col',
					fieldLabel	: 'Tiempo necesario para llegar al colegio:',
					flex		: 1
				},
				{
					name		: 'transporte',
					fieldLabel	: 'Tipo transporte:',
					flex		: 1
				},
				{
					name		: 'vivienda',
					fieldLabel	: 'Tipo vivienda:',
					flex		: 1
				},
				{
					xtype	: 'fieldset',
					items	: [
						{
							xtype		: 'fieldcontainer',
							fieldLabel 	: 'SERVICIOS PÚBLICOS',
		                    layout		: 'vbox',
		                    defaultType	: 'CbDesicion',
							defaults	: {
								flex	: 1,
								labelWidth	: 120
							},
		                    items: [
			                    {
			                        name		: 'luz',
			                        fieldLabel	: 'Fluido eléctrico:',
			                        itemId		: 'cbLuz'
			                    },
			                    {
			                        name		: 'movil',
			                        fieldLabel	: 'Celular:',
			                        itemId		: 'cbCelular'
			                    },
			                    {
			                        name		: 'acueducto',
			                        fieldLabel	: 'Acueducto:',
			                        itemId		: 'cbAcueducto'
			                    },
								{
			                        name		: 'alcantarillado',
			                        fieldLabel	: 'Alcantarillado:',
			                        itemId		: 'cbAlcantarillado'
			                    },
			                    {
			                        name		: 'equipo_sonido',
			                        fieldLabel	: 'Equipo de sonido:',
			                        itemId		: 'cbEqSonido'
			                    },
			                    {
			                        name		: 'television',
			                        fieldLabel	: 'Televisión:',
			                        itemId		: 'cbTelevision'
			                    },
			                    {
			                        name		: 'computadora',
			                        fieldLabel	: 'Computador:',
			                        itemId		: 'cbComputador'
			                    }
			                ]
			            }
		            ]
				},
				{
					name		: 'pregunta1',
					fieldLabel	: '¿Qué es lo que más te gusta hacer:',
					flex		: 1
				},
				{
					name		: 'pregunta2',
					fieldLabel	: '¿Qué es lo que menos te gusta hacer:',
					flex		: 1
				},
				{
					name		: 'cual_positivas',
					fieldLabel	: 'Cualidades positivas:',
					flex		: 1
				},
				{
					name		: 'cual_negativas',
					fieldLabel	: 'Cualidades negativas:',
					flex		: 1
				}
			]
		}		    
	]
});