Ext.define('Admin.view.docentes.FormatoSeguimientoForm' ,{
    extend		: 'Admin.forms.CustomForm',
    alias 		: 'widget.formatoseguimientodocente',
	xtype		: 'formatoseguimientodocente',
	controller	: 'observador',
	initComponent : function (){
		var me	= Admin.getApplication();
		me.onStore('docentes.CargaAgrupadaObservadorStore');
		me.onStore('docentes.FormatoSeguimientoStore');
		this.setTitle('Formato de seguimiento - ' + Global.getYear());
		this.callParent(arguments);
	},
	store			: 'FormatoSeguimientoStore',
	showUndoButton	: true,
    items : [
    	{
			xtype   	: 'customgrid',
			autoLoad	: false,
			selModel	: 'rowmodel',
			store		: 'FormatoSeguimientoStore',
			plugins		: [
				{
					 ptype : 'gridfilters'
				},
				{
                    ptype       	: 'cellediting',
                    clicksToEdit	: 1,
                    default     	: 'textfield'
                },
				{
					ptype : 'responsive'
				},
				{
					ptype			: 'gridSearch',
					readonlyIndexes	: ['note'],
					disableIndexes	: ['pctChange'],
					mode            : 'local',
					flex			: 1,
					autoFocus		: false,
					independent		: true
				}
			],
		    columns: [
		    	{
					xtype	: 'rownumberer'	
				},
		        {
		            text    	: "Apellidos y nombres",
					width		: 300,
		            sortable	: true,
		            dataIndex	: 'nombres',
		            filter		: 'string'
		        },
		        {
		            text		: "Observación",
					width		: 300,
		            sortable	: true,
					dataIndex	: 'obs',
					editor		: {
						xtype			: 'textfield',
						selectOnFocus 	: true
					}
				},
				{
					text		: 'MEDIO DE ACCESO A LA INFORMACIÓN (Marque con una X)',
					tooltip		: 'MEDIO DE ACCESO A LA INFORMACIÓN (Marque con una X)',
					defaults	: {
						width	: 45,
						hideable: false,
						sortable: false,
						menuDisabled	: true
					},
					defaultType	: 'checkcolumn',
					columns		: [
						{
							text		: 'PV',
							dataIndex	: 'pv',
							tooltip		: 'PLATAFORMA VIRTUAL'
						},
						{
							text		: 'TV',
							dataIndex	: 'tv',
							tooltip		: 'Televisión'
						},
						{
							text		: 'GW',
							dataIndex	: 'gw',
							tooltip		: 'GRUPO WHATSAPP'
						},
						{
							text		: 'GF',
							dataIndex	: 'gf',
							tooltip		: 'GUIAS EN FISICO'
						},
						{
							text		: 'OT',
							dataIndex	: 'otro',
							tooltip		: 'OTRO'
						}
					]
				},
				{
					text		: 'SERVICIOS DISPONIBLES (Marque con una X)',
					tooltip		: 'SERVICIOS DISPONIBLES (Marque con una X)',
					defaults	: {
						width	: 45,
						hideable: false,
						sortable: false,
						menuDisabled	: true
					},
					defaultType	: 'checkcolumn',
					columns		: [
						{
							text		: 'EE',
							dataIndex	: 'ee',
							tooltip		: 'ENERGIA ELECTRICA'
						},
						{
							text		: 'IN',
							dataIndex	: 'inter',
							tooltip		: 'INTERNET'
						},
						{
							text		: 'TV',
							dataIndex	: 'tv2',
							tooltip		: 'Televisión'
						},
						{
							text		: 'DC',
							dataIndex	: 'dc',
							tooltip		: 'DATOS DE CELULAR'
						}
					]
				},
				{
					text		: "Grado",
					width		: 150,
					sortable	: true,
					dataIndex	: 'grado'
				},
				{
					text		: "Grupo",
					width		: 65,
					sortable	: true,
					dataIndex	: 'id_group'
				},
				{
					text		: "Jornada",
					width		: 120,
					sortable	: true,
					dataIndex	: 'jornada'
				},
		    ],
		   dockedItems: [
				{
					xtype : 'customToolbar',
					items : [
						{
							xtype		: 'customComboBox',
							fieldLabel	: '',
							store		: 'CargaAgrupadaObservadorStore',
							valueField	: 'grado',
							itemId		: 'cbcarga',
							reference	: 'cbcarga',
							publishes	: 'value',
							minChars	: 2,
							flex		: 1,
							emptyText: 'Seleccione por favor...',
							tpl: Ext.create('Ext.XTemplate',
								'<ul class="x-list-plain"><tpl for=".">',
								'<li role="option" class="x-boundlist-item">{grado} - {grupo} - {jornada} - {sede}</li>',
								'</tpl></ul>'
							),
							// template for the content inside text field
							displayTpl: Ext.create('Ext.XTemplate',
								'<tpl for=".">',
								'{grado} - {grupo} - {jornada} - {sede}',
								'</tpl>'
							),
							listeners: {
								focusenter: function(t) {
									oldValue = t.value;
									if (oldValue) {
										t.expand();
									}
								},
								select: function(c, r, e) {
									var 
										extra = {
											pdbGrado 	: r.get('id_grado'),
											pdbGrupo	: r.get('grupo'),
											pdbSede 	: r.get('id_sede'),
											pdbJorn  	: r.get('id_jorn'),
											pdbTable 	: 'mom_formato_evaluacion'
										};
										
									Admin.getApplication().setParamStore('FormatoSeguimientoStore', extra);
								}
							}
						},
						{
							xtype	: 'customButton',
							tooltip : 'Búscar',
							itemId	: 'btnSearch',
							iconCls	: 'x-fa fa-search',
							bind: {
								disabled: '{!cbcarga.value}'
							},
							handler: function(btn) {
								var 
									store	= Ext.getStore('FormatoSeguimientoStore');
								store.reload();
							}
						},'-',
						{
							xtype	: 'closebutton'
						}						
					]
				},
				{
			        xtype 			: 'pagination',
			        store			: 'FormatoSeguimientoStore'
				}
			]
		}
	],
	saveData: function (storeName, reload) {
        var me      = this.getApp(),
            win     = this,
            store   = Ext.getStore(storeName);

        if (store.getModifiedRecords().length > 0) {
            win.mask('Guardando...');
			store.sync({
				success: function (batch, o) {
					me.showResult('Se han guardado los datos');
				},
				failure: function (re) {
					store.rejectChanges();
				},
				callback: function (b) {
					win.unmask();
				}
			});
        }
    },
});
