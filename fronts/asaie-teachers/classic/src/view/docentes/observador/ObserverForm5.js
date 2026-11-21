Ext.define('Admin.view.docentes.observador.ObserverForm5',{
    extend		: 'Admin.base.SaveWindow',
    alias 		: 'widget.ObserverForm5',
	controller	: 'observador',
	store		: 'ObservadorStore',
	config		: {
		record	:  null
	},
	reloadStore	: true,
    items : [
    	{
			xtype		: 'customform',
			items	: [
				{
					xtype		: 'fieldcontainer',
					fieldLabel	: 'CONDICIONES FÍSICAS',
					layout		: 'hbox',
					defaultType	: 'customtext',
					fieldDefaults: {
						labelAlign: 'top'
					},
					items	: [
						{
							name		: 'talla',
							fieldLabel	: 'Talla:',
							flex		: 1
						},
						{
							name		: 'peso',
							fieldLabel	: 'Peso:',
							flex		: 1,
							margin		: '0 0 0 5'
						}
					]
				},
				{
					xtype		: 'fieldcontainer',
					layout		: 'hbox',
					defaultType	: 'customtext',
					fieldDefaults: {
						labelAlign: 'top'
					},
					items	: [
						{
							fieldLabel	: 'Religíon que profesa:',
							name		: 'religion',
							flex		: 1,
							value		: 'Católica',
						},
						{
							fieldLabel	: 'Deporte que practica:',
							name		: 'deporte',
							flex		: 1,
							margin		: '0 0 0 5',
							value		: 'Ninguno'
						}
					]
				},
				{
					xtype		: 'fieldcontainer',
					layout		: 'hbox',
					defaultType	: 'customtext',
					fieldDefaults: {
						labelAlign: 'top'
					},
					items	: [
						{
							xtype 		: 'CbADesicion',
							name		: 'trabaja',
							fieldLabel	: 'Trabaja:',
							flex		: 1
						},
						{
							name		: 'prof_oficio',
							fieldLabel	: 'Profesión/Oficio:',
							allowBlank	: true,
							flex		: 3,
							margin		: '0 0 0 5'
						}
					]
				},
				{
					xtype 		: 'fieldcontainer',
					layout		: 'hbox',
					defaultType	: 'customnumberfield',
					fieldLabel	: 'INFORMACIÓN FAMILIAR',
					fieldDefaults: {
						labelAlign: 'top'
					},
					items	: [
						{
							fieldLabel	: '# de Hermanos:',
							flex		: 1,
							name		: 'num_hermanos',
							value		: 0,
						},
						{
							fieldLabel	: 'Lugar que ocupa:',
							flex		: 1,
							name		: 'lugar_hermanos',
							margin		: '0 0 0 5',
							value		: 0
						},
						{
							fieldLabel: 'Hombres',
							flex: 1,
							name: 'num_hermanos_hombres',
							margin: '0 0 0 5',
							value: 0
						},
						{
							fieldLabel: 'Mujeres',
							flex: 1,
							name: 'num_hermanos_mujeres',
							margin: '0 0 0 5',
							value: 0
						}
					]
				},
				{
					xtype 		: 'fieldcontainer',
					layout		: 'hbox',
					defaultType	: 'customtext',
					fieldDefaults: {
						labelAlign: 'top'
					},
					items	: [
						{
							xtype: 'CbADesicion',
							fieldLabel: 'Hijo de madre cabeza de hogar:',
							name: 'madre_cabeza_hogar',
							flex: 1
						},
						{
							xtype: 'CbADesicion',
							fieldLabel: 'Hijo de padre cabeza de hogar:',
							name: 'padre_cabeza_hogar',
							flex: 1,
							margin: '0 0 0 5'
						},
						{
							xtype: 'CbADesicion',
							fieldLabel: 'Desplazados:',
							name: 'desplazados',
							flex: 1,
							margin: '0 0 0 5'
						}
					]
				},
				{
					xtype 		: 'CbADesicion',
					name		: 'barreras_aprendizaje',
					fieldLabel	: 'BARRERAS PARA EL APRENDIZAJE:',
				},
				{
					xtype 		: 'fieldcontainer',
					fieldLabel	: 'LIMITACIONES VISUALES',
					defaultType	: 'customtext',
					labelAlign	: 'top',
					layout		: 'hbox',
					defaults	: {
						allowBlank	: true
					},
					items: [
						{
							name		: 'det_limit_visual',
							fieldLabel	: 'DETALLE:',
							flex		: 1
						},
						{
							name		: 'eps_dx_doctor_limit_visual',
							fieldLabel	: 'EPS DX/DOCTOR:',
							flex		: 1,
							margin: '0 0 0 5'
						}
					]
				},
				{
					xtype 		: 'fieldcontainer',
					fieldLabel	: 'LIMITACIONES AUDITIVAS',
					defaultType	: 'customtext',
					labelAlign	: 'top',
					layout		: 'hbox',
					defaults	: {
						allowBlank	: true
					},
					items: [
						{
							name		: 'det_limit_auditiva',
							fieldLabel	: 'DETALLE:',
							flex		: 1
						},
						{
							name		: 'eps_dx_doctor_auditiva',
							fieldLabel	: 'EPS DX/DOCTOR:',
							flex		: 1,
							margin: '0 0 0 5'
						}
					]
				},
				{
					xtype 		: 'fieldcontainer',
					fieldLabel	: 'LIMITACIONES TRASTORNOS DEL LENGUAJE',
					defaultType	: 'customtext',
					labelAlign	: 'top',
					layout		: 'hbox',
					defaults	: {
						allowBlank	: true
					},
					items: [
						{
							name		: 'det_limit_trans_lenguaje',
							fieldLabel	: 'DETALLE:',
							flex		: 1
						},
						{
							name		: 'eps_dx_doctor_trans_lenguaje',
							fieldLabel	: 'EPS DX/DOCTOR:',
							flex		: 1,
							margin: '0 0 0 5'
						}
					]
				},
				{
					xtype 		: 'fieldcontainer',
					fieldLabel	: 'LIMITACIONES MOTRICIDAD',
					defaultType	: 'customtext',
					labelAlign	: 'top',
					layout		: 'hbox',
					defaults	: {
						allowBlank	: true
					},
					items: [
						{
							name		: 'det_limit_motricidad',
							fieldLabel	: 'DETALLE:',
							flex		: 1
						},
						{
							name		: 'eps_dx_doctor_motricidad',
							fieldLabel	: 'EPS DX/DOCTOR:',
							flex		: 1,
							margin: '0 0 0 5'
						}
					]
				},
				{
					xtype 		: 'fieldcontainer',
					fieldLabel	: 'OTRAS LIMITACIONES',
					defaultType	: 'customtext',
					labelAlign	: 'top',
					layout		: 'hbox',
					defaults	: {
						allowBlank	: true
					},
					items: [
						{
							name		: 'det_limit_otra',
							fieldLabel	: 'DETALLE:',
							flex		: 1
						},
						{
							name		: 'eps_dx_doctor_otra',
							fieldLabel	: 'EPS DX/DOCTOR:',
							flex		: 1,
							margin: '0 0 0 5'
						}
					]
				},
				{
					xtype 	: 'fieldset',
					items	: [
						{
							xtype		: 'fieldcontainer',
							fieldLabel 	: 'DIFICULTADES PARA APRENDIZAJE',
							layout		: 'vbox',
							labelAlign	: 'top',
							defaults	: {
								flex	: 1,
								labelWidth	: 200
							},
							items: [
								{
									xtype 		: 'CbADesicion',
									name		: 'dificultad_aprendizaje',
									fieldLabel	: 'DIFICULTADES PARA EL APRENDIZAJE:',
								},
								{
									xtype		: 'CbDislexia',
									fieldLabel	: 'DISLEXIA:',
								},
								{
									xtype		: 'CbDisgrafia',
									fieldLabel	: 'DISGRAFÍA:',
								},
								{
									xtype		: 'CbDiscalculia',
									fieldLabel	: 'DISCALCULÍA:',
								},
								{
									xtype		: 'CbDiscapacidadIntelectual'
								},
								{
									xtype		: 'CbDiscapacidadMemoriaAuditivo'
								},
								{
									xtype		: 'CbTEA'
								},
								{
									xtype		: 'CbTDHA'
								},
								{
									xtype		: 'customtext',
									name		: 'otra_dificulta_aprendizaje',
									fieldLabel	: 'Otra dificultad de aprendizaje:',
									allowBlank	: true,
								}
							]
						}
					]
				}
			]
		}		    
	],
	saveData	: function(storeName,reload){
		const me = this.getApp(),
			win = this,
			form = win.down('form'),
			record = form.getRecord(),
			values = form.getValues(),
			store = Ext.getStore(storeName);
		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				win.mask('Guardando...');
			}
			record.set(values);
			store.sync({
				success : function() {
					me.showResult('Se han guardado los datos');
					win.unmask();
					if (reload === true){
						store.reload();
					}
					win.close();
				},
				failure	: function (re) {
					win.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
			win.mask('Guardando...');
			values.id_matric 	= win.getRecord().get('id');
			values.year 		= Global.getYear();
			store.insert(0,values);
			store.sync({
				success : function(){
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
					if (reload === true){
						store.reload();
					}
				},
				failure	: function () {
					store.rejectChanges();
					win.unmask();
				}
			});
		};
	}
});
