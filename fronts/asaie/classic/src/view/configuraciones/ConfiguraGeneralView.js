/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.ConfiguraGeneralView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Configuraciones',
    controller  : 'configuraciones',
	alias       : 'widget.configuraGeneralView',
	store		: 'ConfiguracionesStore',
	config		: {
		record	: null
	},
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbGradosAgrupados',
					name		: 'id_grupo_grados',
					labelAlign  : 'top'
				},
				{
					xtype   : 'fieldSet',
					title   : 'Trabajar procesos educativos para impresión de boletines por:',
					items   : [
						{
							xtype   : 'customradiogroup',
							items   : [
								{
									boxLabel    : 'Objetivos',
									name        : 'procesos',
									inputValue  : 1
								},
								{
									boxLabel    : 'Logros e indicadores de logros',
									name        : 'procesos',
									inputValue  : 2
								},
								{
									boxLabel    : 'Competencias y estándares de competencia',
									name        : 'procesos',
									inputValue  : 3
								},
								{
									boxLabel    : 'Fortaleza y dificultades',
									name        : 'procesos',
									inputValue  : 4
								}
							]
						}
					]
				},
				{
					xtype   : 'customcheckboxfield',
					name    : 'porcentaje_areas',
					boxLabel: 'Trabajar áreas con porcentajes.'
				},
				{
					xtype   : 'customcheckboxfield',
					name    : 'docente_ficha_obs',
					boxLabel: 'Permitir al docente diligenciar ficha de observador.'
				},
				{
					xtype   : 'customnumberfield',
					name    : 'cant_est_x_libro',
					fieldLabel  : 'Cantidad de estudiantes por libro de matriculas y calificaciones:',
					labelAlign  : 'top'
				},
				{
					xtype   : 'customcheckboxfield',
					name    : 'ficha_mat_x_año',
					boxLabel: 'Establecer, como predeterminada, ficha de matricula por año.'
				},
				{
					xtype   : 'customcheckboxfield',
					name    : 'prom_area_puesto',
					boxLabel: 'Generar puestos y promedios por Áreas.'
				},
				{
					xtype       : 'fieldSet',
					defaultType : 'customnumberfield',
					layout      : 'vbox',
					title   	: 'Redondeo de notas',
					labelWidth  : 60,
					items       : [
						{
							fieldLabel  : 'Redondear a',
							name        : 'nota_final_redondeo',
							width       : 300
						},
						{
							width       : 300,
							name        : 'nota_redondeo',
							fieldLabel  : ' si la nota final es >= a'
						},
						{
							xtype   : 'customcheckboxfield',
							name    : 'aplicar_redondeo_fin_año',
							boxLabel: 'Aplicar al promedio de Áreas y asignaturas de fin de año.'
						}
					]
				},
				/*{
					xtype   : 'fieldSet',
					title   : 'Trabajar año  lectivo por:',
					items   : [
						{
							xtype   : 'customradiogroup',
							items   : [
								{
									boxLabel    : 'Áreas',
									name        : 't_año_lectivo',
									inputValue  : 1
								},
								{
									boxLabel    : 'Asignaturas',
									name        : 't_año_lectivo',
									inputValue  : 2
								}
							]
						}
					]
				},*/
				{
					xtype   : 'fieldSet',
					title   : 'Pierden directamente con:',
					items   : [
						{
							xtype   : 'customradiogroup',
							vertical: false,
							items   : [
								{
									boxLabel    : '1 o más',
									name        : 'areas_pierde',
									inputValue  : 1
								},
								{
									boxLabel    : '2 o más',
									name        : 'areas_pierde',
									inputValue  : 2
								},
								{
									boxLabel    : '3 o más',
									name        : 'areas_pierde',
									inputValue  : 3
								},
								{
									boxLabel    : '4 o más',
									name        : 'areas_pierde',
									inputValue  : 4
								},
								{
									boxLabel    : '5 o más',
									name        : 'areas_pierde',
									inputValue  : 5
								},
							]
						}
					]
				},
				{
					xtype   : 'fieldSet',
					title   : 'Luego de las estrategias de apoyo, pierden año lectivo los estudiantes que persistan en perdida de:',
					items   : [
						{
							xtype   : 'customradiogroup',
							items   : [
								{
									boxLabel    : '1 De las recuperaciones',
									name        : 'pierde_luego_rec',
									inputValue  : 1
								},
								{
									boxLabel    : 'Todas las recuperaciones',
									name        : 'pierde_luego_rec',
									inputValue  : 2
								},
								{
									boxLabel    : 'No aplica',
									name        : 'pierde_luego_rec',
									inputValue  : 3
								}
							]
						}
					]
				},
				{
					xtype   : 'fieldSet',
					title   : 'Trabajar Grupos por:',
					items   : [
						{
							xtype   : 'customradiogroup',
							items   : [
								{
									boxLabel    : 'Números. Ej. 01, 02. Etc.',
									name        : 'grupo',
									inputValue  : 1
								},
								{
									boxLabel    : 'Letras. Ej. A, B, C. Etc.',
									name        : 'grupo',
									inputValue  : 2
								}
							]
						}
					]
				},
				{
					xtype   : 'fieldSet',
					title   : 'Promocionar estudiantes por:',
					items   : [
						{
							xtype   : 'customradiogroup',
							items   : [
								{
									boxLabel    : 'Promedios',
									name        : 'promocion',
									inputValue  : 1
								},
								{
									boxLabel    : 'Promedios - Desenpeño Alto',
									name        : 'promocion',
									inputValue  : 2
								},
								{
									boxLabel    : 'Periodo final',
									name        : 'promocion',
									inputValue  : 3
								},
								{
									boxLabel    : 'Desempeños - Logros',
									name        : 'promocion',
									inputValue  : 5,
									tooltip     : 'xx'
								}
							]
						}
					]
				},
				{
					xtype   : 'customnumberfield',
					name    : 'Ndecimales',
					fieldLabel  : 'Número de decimales en notas.',
					labelAlign  : 'top'
				},
				{
					xtype   : 'customnumberfield',
					name    : 'nota_max_rec',
					fieldLabel  : 'Nota máxima aceptada en el proceso de estrategias de apoyo (recuperación) periódicas y final.',
					labelAlign  : 'top'
				},
				{
					xtype   : 'customnumberfield',
					name    : 'porciento_ausencia',
					fieldLabel  : 'Porcentaje de inasistencia injustificada para perder un área.',
					labelAlign  : 'top'
				},
				{
					xtype   : 'customnumberfield',
					name    : 'prom_areas',
					fieldLabel  : 'Si el estudiante pierde UN ÁREA y el PROMEDIO de esta es igual o superior a:',
					labelAlign  : 'top'
				},
				{
					xtype   : 'label',
					text    : 'se promoverá al grado inmediatamente superior, sin hacer la actividad de estrategia de apoyo(recuperación).'
				},
				{
					xtype   : 'fieldcontainer',
					layout  : 'hbox',
					items   : [
						{
							xtype   : 'customcheckboxfield',
							name    : 'pierde_año_lectivo_area',
							reference   : 'cbPierde',
							publishes   : 'value',
							boxLabel    : 'Al finalizar el año escolar, no será promovido el estudiante que pierda las siguientes áreas:',
							inputValue  : 1,
							flex        : 1
						},
						{
							xtype   : 'customButton',
							text    : '...',
							iconCls : '',
							bind    : {
								disabled : '{!cbPierde.value}'
							},
							handler	: function(btn){
								var 
									ts = btn.up('window');
								if(ts.getRecord()){
									Ext.create('Admin.view.configuraciones.areas.Areas',{
										record	: ts.getRecord()
									}).show();
								}else{
									Admin.getApplication().showResult('Debe guardar el registro para realizar esta configuración.');
								}
							}
						}
					]
				},
				{
					xtype   	: 'customcheckboxfield',
					name    	: 'a_estra_apoyo_fecha',
					reference   : 'cbMax',
					publishes   : 'value',
					boxLabel	: 'El estudiante que no se presente a las estrategias de apoyo (nivelaciones) en la fecha estipulada no será promovido al siguiente grado.'
				},
				{
					xtype		: 'customDate',
					fieldLabel	: 'Fecha máxima',
					name		: 'fecha_prom',
					allowBlank	: true,
					bind    : {
						disabled : '{!cbMax.value}'
					}
				}
            ]
        }
    ]
});
