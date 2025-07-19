Ext.define('Admin.view.docentes.observador.CrudObserverView' ,{
    extend		: 'Admin.base.WindowCrud',
    alias 		: 'widget.crudObserverView',
    xtype 		: 'crudObserverView',
	itemId		: 'CrudObserverView',
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
					const record = grid.getStore().proxy.extraParams;
					const nCount = grid.getStore().getCount();
					const tipo   = record.typeObserver || 3; // TODO: Asignar Tipo de observador
					if(nCount >0){
						this.down('#addButton').setDisabled(true);
					}else{
						this.down('#addButton').setDisabled(false);
					}
					switch(tipo){
						case 1 :
							this.down('#btnFort').setText('Fortalezas y dificultades');
							this.down('#btnAnotaciones').setHidden(true);
							break;
						case 2 :
							this.down('#btnFort').setText('Fortalezas y dificultades');
							this.down('#btnAnotaciones').setHidden(true);
							break;
						case 3 :
							this.down('#btnFort').setText('Aspectos y criterios');
							this.down('#btnAnotaciones').setHidden(false);
							break;
						case 4 :
							this.down('#btnFort').setText('Fortalezas y dificultades');
							this.down('#btnAnotaciones').setHidden(true);
							break;
						case 5 :
							this.down('#btnFort').setHidden(true);
							this.down('#btnAnotaciones').setHidden(false);
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
			        	'-',
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
		const record = this.getRecord();
		const tipo    = record.get('typeObserver') || 3; // TODO: Asignar Tipo de observador
		let view = 'Admin.view.docentes.observador.DatosView'
		switch(tipo){
			case 1 :
				view = 'Admin.view.docentes.observador.DatosView';
				break;
			case 2 :
				view = 'Admin.view.docentes.observador.DatosView';
				break;
			case 3 :
				view = 'Admin.view.docentes.observador.DatosView_3';
				break;
			case 4 :
				view = 'Admin.view.docentes.observador.DatosView';
				break;
			case 5 :
				view = 'Admin.view.docentes.observador.ObserverForm5';
				break;
		}
		this.setWinObject(Ext.create(view));
	},
	showWindow	: function(btn){
		const me	 	= this;
		const data = btn.up('window').down('grid').getSelection()[0];

		if(!me.getWinObject()){
			me.buildWindow();
		}
		const form 	= me.getWinObject().down('form');
		form.reset(true);
		if(btn.itemId === 'editButton'){
			form.loadRecord(data);
		}
		me.getWinObject().setRecord(me.getRecord());
		me.getWinObject().show();
	}
});
