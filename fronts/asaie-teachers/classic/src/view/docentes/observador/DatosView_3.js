Ext.define('Admin.view.docentes.observador.DatosView_3',{
    extend		: 'Admin.base.SaveWindow',
    alias 		: 'widget.DatosView_3',
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
					layout		: 'hbox',
					defaultType	: 'customtext',
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
						},
						{
							name		: 'religion',
							fieldLabel	: 'Religíon que profesa:',
							flex		: 3,
							margin		: '0 0 0 5'
						},
					]
				},
				{
					xtype		: 'fieldcontainer',
					layout		: 'hbox',
					defaultType	: 'customtext',
					items	: [
						{
							name		: 'musica',
							fieldLabel	: 'Música que le gusta:',
							flex		: 3
						},
						{
							name		: 'arte',
							fieldLabel	: 'Arte:',
							flex		: 3,
							margin		: '0 0 0 5'
						},
					]
				},
				{
					xtype		: 'fieldcontainer',
					layout		: 'hbox',
					defaultType	: 'customtext',
					items	: [
						{
							name		: 'comida',
							fieldLabel	: 'Comida(s) que le gusta(n):',
							flex		: 1
						},
						{
							name		: 'prof_oficio',
							fieldLabel	: 'Profesión/Oficio:',
							flex		: 1,
							margin		: '0 0 0 5'
						}
					]
				},
	            {
	            	xtype 	: 'fieldset',
	            	items	: [
	            		{	            	
							xtype		: 'fieldcontainer',
							fieldLabel 	: 'NIVEL DE DESEMPEÑO EN',
		                    layout		: 'vbox',
		                    defaultType	: 'CbSituacion',
							labelAlign	: 'top',
							defaults	: {
								flex	: 1,
								labelWidth	: 150
							},
		                    items: [
			                    {
			                        name		: 'motricidad_fina',
			                        fieldLabel	: 'Motricidad fina:',
			                        itemId		: 'cbMoFina'
			                    },
			                    {
			                        name		: 'motricidad_gruesa',
			                        fieldLabel	: 'Motricidad Gruesa:',
			                        itemId		: 'cbMoGruesa'
			                    },
			                    {
			                        name		: 'temporo_espacial',
			                        fieldLabel	: 'U. Temporo espacial:',
			                        itemId		: 'cbTemporoEspacial'
			                    },
								{
									name		: 'actitud_verval',
									fieldLabel	: 'Actitud Verbal:',
									itemId		: 'cbActVerval'
								},
								{
									name		: 'artitud_numerica',
									fieldLabel	: 'Actitud Numérica:',
									itemId		: 'cbActNumerica'
								},
								{
									name		: 'liderazgo',
									fieldLabel	: 'Liderazgo:',
									itemId		: 'cbLiderazgo'
								},
								{
									name		: 'comportamiento',
									fieldLabel	: 'Comportamiento:',
									itemId		: 'cbComportamiento'
								}
			                ]
			            }
			        ]
				},
				{
					xtype 	: 'fieldset',
					items	: [
						{
							xtype		: 'fieldcontainer',
							fieldLabel 	: 'DIFICULTADES DE APRENDIZAJE',
							labelAlign	: 'top',
							layout		: 'vbox',
							defaults	: {
								flex	: 1,
								labelWidth	: 150
							},
							items: [
								{
									xtype		: 'CbDislexia'
								},
								{
									xtype		: 'CbDisortografia'
								},
								{
									xtype		: 'CbDiscalculia'
								}
							]
						}
					]
				}
			]
		}		    
	],
	saveData	: function(storeName,reload){
		var me 		= this.getApp(),
			win		= this,
			form    = win.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			store   = Ext.getStore(storeName);
		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				win.mask('Guardando...');
			}
			record.set(values);
			store.sync({
				success : function(batch, o) {
					me.showResult('Se han guardado los datos');
					win.unmask();
					if (reload == true){
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
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
					if (reload == true){
						store.reload();
					}
				},
				failure	: function (re) {
					store.rejectChanges();
					win.unmask();
				}
			});
		};
	}
});
