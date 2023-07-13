Ext.define('Admin.view.docentes.observador.FichaSeguimientoForm' ,{
    extend		: 'Admin.forms.CustomForm',
    alias 		: 'widget.fichaseguimientodocente',
	xtype		: 'fichaseguimientodocente',
	controller	: 'observador',
	initComponent : function (){
		const me = Admin.getApplication();
		me.onStore('docentes.CargaAgrupadaObservadorStore');
		me.onStore('docentes.EstudiantesStore');
		me.onStore('docentes.observador.ObservadorStore');
		me.onStore('docentes.observador.DesicionStore');
		me.onStore('docentes.observador.SituacionStore');
		me.onStore('docentes.observador.DiscalculiaStore');
		me.onStore('docentes.observador.DislexiaStore');
		me.onStore('docentes.observador.ItemsModelo3Store');
		me.onStore('docentes.observador.DisortografiaStore');
		this.setTitle('Ficha de seguimiento - ' + Global.getYear());
		this.callParent(arguments);
	},
    items : [
    	{
			xtype   	: 'customgrid',
			autoLoad	: false,
			selModel	: 'rowmodel',
			store		: 'EstudiantesStore',
			plugins		: [
				{
					 ptype : 'gridfilters'
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
		            text		: "Grado",
					width		: 150,
		            sortable	: true,
		            dataIndex	: 'grado'
		        },
		        {
		            text		: "Grupo",
		            width		: 60,
		            sortable	: true,
		            dataIndex	: 'id_group'
		        },
		        {
		            text		: "Jornada",
		            width		: 120,
		            sortable	: true,
		            dataIndex	: 'jornada'
		        },
		        {
		            text		: "Sede",
					flex		: 2,
		            sortable	: true,
		            dataIndex	: 'sede'
		        },
		        {
		            text		: "Año",
		            width		: 60,
		            dataIndex	: 'year'
		        }, 
		        {
					text		: "Estado",
					width		: 150,
		            dataIndex	: 'estado'
				}
		    ],
		    listeners: {
			    'selectionchange': function(grid, selected, eOpts) {
			        this.down('#btnObservador').setDisabled(!selected.length);
			    }
			},
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
									if (t.value) {
										t.expand();
									}
								},
								select: function(c, r, e) {
									const extra = {
										pdbGrado: r.get('id_grado'),
										pdbGrupo: r.get('grupo'),
										pdbSede: r.get('id_sede'),
										pdbJorn: r.get('id_jorn')
									};
									Admin.getApplication().setParamStore('EstudiantesStore', extra);
								}
							}
						},
						{
							xtype	: 'customButton',
							tooltip : 'Buscar',
							itemId	: 'btnSearch',
							iconCls	: 'x-fa fa-search',
							bind: {
								disabled: '{!cbcarga.value}'
							},
							handler: function(btn) {
								var 
									store	= Ext.getStore('EstudiantesStore');
								store.reload();
							}
						},'-',
						{
							xtype 	: 'customButton',
							itemId	: 'btnObservador',
							text 	: 'Ver fichas',
							disabled: true,
							iconCls : 'x-fa fa-spinner',
							handler	: 'onClickCrudObservador'
						},
						{
							xtype	: 'closebutton'
						}						
					]
				},
				{
			        xtype 			: 'pagination',
			        store			: 'EstudiantesStore'
				}
			]
		}
	]
});
