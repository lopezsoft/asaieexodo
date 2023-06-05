Ext.define('Admin.view.docentes.observador.CrudObservadorView' ,{
    extend		: 'Admin.base.WindowCrud',
    alias 		: 'widget.crudobservador',
    xtype 		: 'crudobservador',
	itemId		: 'CrudObservadorView',
	controller	: 'observador',
	config		: {
		record	:  null
	},
    items : [
    	{
		    xtype   	: 'customgrid',
		    store		: 'ObservadorStore',
		    columns: [
		    	{
					xtype	: 'rownumberer'	
				},
		        {
		            text		: "Grado",
		            flex		: 2,
		            dataIndex	: 'grado'
		        },
		        {
		            text		: "Grupo",
		            width		: 60,
		            dataIndex	: 'id_group'
		        },
				{
					text		: "Jornada",
					width		: 120,
					sortable	: true,
					dataIndex	: 'jornada'
				},
		        {
		            text		: "Fecha",
		            width		: 90,
		            dataIndex	: 'fecha'
		        },
		        {
		            text		: "Año",
		            width		: 60,
		            dataIndex	: 'year'
		        }
		    ],
		    listeners: {
			    'selectionchange': function(grid, selected) {
			        this.down('#printButton').setDisabled(!selected.length);
			        this.down('#editButton').setDisabled(!selected.length);
			        this.down('#btnFort').setDisabled(!selected.length);
					this.down('#btnAnotaciones').setDisabled(!selected.length);
					this.down('#addButton').setDisabled(true);
			    },
				afterrender : function (grid) {
					var nCount 	= grid.getStore().getCount(),
						tipo	= '3';
					if(nCount >0){
						this.down('#addButton').setDisabled(true);
					}else{
						this.down('#addButton').setDisabled(false);
					}
					switch(tipo){
						case '1' :
							this.down('#btnFort').setText('Fortalezas y dificultades');
							this.down('#btnAnotaciones').setHidden(true);
							break;
						case '2' :
							this.down('#btnFort').setText('Fortalezas y dificultades');
							this.down('#btnAnotaciones').setHidden(true);
							break;
						case '3' :
							this.down('#btnFort').setText('Aspectos y criterios');
							this.down('#btnAnotaciones').setHidden(false);
							break;
						case '4' :
							this.down('#btnFort').setText('Fortalezas y dificultades');
							this.down('#btnAnotaciones').setHidden(true);
							break;
						default :
							this.down('#btnFort').setText('Fortalezas y dificultades');
							this.down('#btnAnotaciones').setHidden(true);
							break;
					}

				}
			},
		   dockedItems: [
				{
					xtype : 'toolbarCrud'
				},
				{
			        xtype 			: 'pagination',
			        store			: 'ObservadorStore',
					displayInfo 	: false,
			        items			: [
			        	,'-',
			        	{
							xtype		: 'customButton',
							text		: 'Anotaciones',
							itemId		: 'btnAnotaciones',
							handler		: 'onAnotaciones',
                            disabled    : true
						},'-',
						{
							xtype 	: 'customButton',
							iconCls : 'x-fa fa-spinner',
							text 	: 'Fortalezas y dificultades',
							itemId	: 'btnFort',
							handler	: 'onFortDif',
							disabled: true
						}
			        ]
				}
			]
		}
	],
	buildWindow : function(){
		var tipo    = '3'; // TODO: Asignar Tipo de observador
		switch(tipo){
			case '1' :
				view = 'Admin.view.docentes.observador.DatosView';
				break;
			case '2' :
				view = 'Admin.view.docentes.observador.DatosView';
				break;
			case '3' :
				view = 'Admin.view.docentes.observador.DatosView_3';
				break;
			case '4' :
				view = 'Admin.view.docentes.observador.DatosView';
				break;
			default :
				view = 'Admin.view.docentes.observador.DatosView';
				break;
		}
		this.setWinObject(Ext.create(view));
	},
	showWindow	: function(btn){
		var me	 	= this,
			data	= btn.up('window').down('grid').getSelection()[0];
		
		if(!me.getWinObject()){
			me.buildWindow();
		}
		form 	= me.getWinObject().down('form'),
		form.reset(true);
		if(btn.itemId == 'editButton'){
			form.loadRecord(data);
		}
		me.getWinObject().setRecord(me.getRecord());
		me.getWinObject().show();
	}
});
