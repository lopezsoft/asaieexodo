Ext.define('Admin.view.convivencia.coordinacion.EstudiantesView' ,{
    extend	: 'Admin.base.WindowCrud',
    requires: [
        'Admin.store.docentes.EstudiantesStore'
    ],
    alias 		: 'widget.EstudiantesView',
	showToll	: false,

	controller	:'convivencia',

	maximized	: true,
    items : [
    	{
		    xtype   	: 'customgrid',
			plugins		: [
				{
					ptype: 'rowexpander',
					rowBodyTpl : new Ext.XTemplate(
						'<p><b>Descripción:</b> {descripcion}</p>'
					)
				},
				{
					ptype			: 'gridSearch',
					readonlyIndexes	: ['note'],
					disableIndexes	: ['pctChange'],
					minChars		: 1,
					mode            : 'local',
					flex			: 1,
					autoFocus		: false,
					independent		: true
				}
			],
		    store		: 'EstudiantesStore',
			autoLoad	: false,
			iconCls		: '',
		    columns: [
		    	{
					xtype	: 'rownumberer'	
				},
		        {
		            text    	: "Apellidos y nombres",
		           	flex		: 3,
		            sortable	: true,
		            dataIndex	: 'nombres',
		            filter		: 'string'
		        },
		        {
		            text		: "Grado",
		            flex		: 1,
		            sortable	: true,
		            dataIndex	: 'grado'
		        },
		        {
		            text		: "Grupo",
		            width		: 60,
		            sortable	: true,
		            dataIndex	: 'grupo'
		        },
		        {
		            text		: "Jornada",
		            width		: 90,
		            sortable	: true,
		            dataIndex	: 'jornada',
					filter		: 'list'
		        },
		        {
		            text		: "Sede",
		            flex		: 2,
		            sortable	: true,
		            dataIndex	: 'sede',
					filter		: 'list'
		        },
		        {
		            text		: "Año",
		            width		: 60,
		            dataIndex	: 'año'
		        }, 
		        {
					text		: "Estado",
		            flex		: 1,
		            dataIndex	: 'estado',
		            renderer :  function(val) {
		            	switch(val){
							case '1':
								return '<span style="color:black;">' + 'Inscrito(a)' + '</span>';
								break;
							case '2':
								return '<span style="color:black;">' + 'Matriculado(a)' + '</span>';
								break;
							case '3':
								return '<span style="color:black;">' + 'Promovido(a)' + '</span>';
								break;
							case '4':
								return '<span style="color:red;">' + 'Retirado(a)-Desertor(a)' + '</span>';
								break;
							case '5':
								return '<span style="color:black;">' + 'Incapacitado' + '</span>';
								break;
							case '5':
								return '<span style="color:black;">' + 'Licencia' + '</span>';
								break;
							default:
								return '<span style="color:red;">' + 'ERROR' + '</span>';
								break;
						}
						return val;
					}
				}
		    ],
		    listeners: {
			    'selectionchange': function(grid, selected, eOpts) {
			    	this.down('#btnVerSituaciones').setDisabled(!selected.length);
					this.down('#btnMenuFormatos').setDisabled(!selected.length);
			    }
			},
		   dockedItems: [
			    {
					xtype : 'customToolbar',
                    itemId: 'toolSearch',
					defaults : {
						emptyText 	: 'Seleccione el valor',
						labelWidth	: 60
					},
					items : [
						{
							xtype 	: 'CbGrados',
							width 	: 280
						},
						{
							xtype	: 'CbGrupo',
							width 	: 145,
							bind	: {
								visible : '{comboGrados.value}'
							}
						},
						{
							xtype	: 'customButton',
							iconCls : 'x-fa fa-search',
							itemId	: 'btnSearch',
							bind	: {
								visible : '{comboGrupo.value}'
							},
							handler : function (btn) {
								var me 		= Admin.getApplication(),
									win		= btn.up('window'),
									store 	= Ext.getStore('EstudiantesStore'),
									extra	= {};

								extra = {
									pdbCodGrado : win.down('#comboGrados').value,
									pdbGrupo 	: win.down('#comboGrupo').value
								};

								store.setPageSize(0);

								me.setParamStore(store,extra,true);

							}
						}
					]
			    },
				{
					xtype : 'customToolbar',
					items : [
						{
							xtype 	: 'customButton',
							itemId	: 'btnVerSituaciones',
							text 	: 'Situaciones del estudiante',
							disabled: true,
							iconCls : 'x-fa fa-spinner',
							handler	: 'onSituacionesEst'
						},'-',
						{
							xtype	: 'customButton',
							itemId	: 'btnMenuFormatos',
							text	: 'Formatos',
							disabled: true,
							iconCls	: 'x-fa fa-bars',
							menu	: [
								{
									iconCls	: 'x-fa fa-bars',
									text	: 'Entrevista'
								},
								{
									iconCls	: 'x-fa fa-bars',
									text	: 'Sesiones'
								},
								{
									iconCls	: 'x-fa fa-bars',
									text	: 'Casos'
								}
							]
						}
						,'->',
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