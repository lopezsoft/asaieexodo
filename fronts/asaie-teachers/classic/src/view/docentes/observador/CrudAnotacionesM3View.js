Ext.define('Admin.view.docentes.observador.CrudAnotacionesM3View',{
    extend		: 'Admin.base.WindowCrud',
    alias 		: 'widget.CrudAnotacionesM3View',
	controller	: 'observador',
	config		: {
		record : null
	},
    items : [
    	{
		    xtype   	: 'customgrid',
		    store		: 'AnotacionesM3Store',
		    plugins		: [
			    {
		            ptype: 'rowexpander',
		            rowBodyTpl : new Ext.XTemplate(
		                '<p><b>Anotación:</b> {anotacion}</p>',
						'<p><b>Compromiso del estudiante:</b> {compromiso_est}</p>',
						'<p><b>Compromiso del acudiente:</b> {compromiso_acu}</p>',
						'<p><b>Compromiso de la Institución:</b> {compromiso_inst}</p>'
		           	)
		         },
		         {
				 	ptype : 'gridfilters'
				 }
		    ],
		    columns: [
		    	{
					xtype	: 'rownumberer'	
				},
				{
					text		: "PER",
					width		: 50,
					sortable	: true,
					dataIndex	: 'periodo',
					filter		: 'string'
				},
		        {
		            text		: "Anotación",
		            flex		: 3,
		            sortable	: true,
		            dataIndex	: 'anotacion',
		            filter		: 'string'
		        },
		        {
		            text		: "Compromiso del estudiante",
					flex		: 3,
		            sortable	: true,
		            dataIndex	: 'compromiso_est',
		            filter		: 'list'
		        },
				{
					text		: "Compromiso del acudiente",
					flex		: 3,
					sortable	: true,
					dataIndex	: 'compromiso_acu',
					filter		: 'string'
				},
				{
					text		: "Compromiso de la Institución",
					flex		: 3,
					sortable	: true,
					dataIndex	: 'compromiso_inst',
					filter		: 'list'
				},
		        {
		            text		: "Fecha",
		            sortable	: true,
		            dataIndex	: 'fecha'
		        }
		    ],
		   dockedItems: [
				{
					xtype : 'toolbarCrud'
				},
				{
			        xtype 			: 'pagination',
			        store			: 'AnotacionesM3Store'
				}
			]
		}
	],
	buildWindow : function(){
		this.setWinObject(Ext.create('Admin.view.docentes.observador.AnotacionesM3View'));
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
