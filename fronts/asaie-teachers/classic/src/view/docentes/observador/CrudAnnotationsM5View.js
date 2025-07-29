Ext.define('Admin.view.docentes.observador.CrudAnnotationsM5View',{
    extend		: 'Admin.base.WindowCrud',
    alias 		: 'widget.CrudAnnotationsM5View',
	controller	: 'observador',
	config		: {
		record : null
	},
    items : [
    	{
		    xtype   	: 'customgrid',
		    store		: 'AnnotationsM5Store',
		    plugins		: [
			    {
		            ptype: 'rowexpander',
		            rowBodyTpl : new Ext.XTemplate(
		                '<p><b>Anotación:</b> {annotation}</p>',
						'<p><b>Tratamiento</b> {description}</p>',
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
					text		: "Periodo",
					width		: 100,
					sortable	: true,
					dataIndex	: 'period',
					filter		: 'string'
				},
		        {
		            text		: "Anotación",
		            flex		: 3,
		            sortable	: true,
		            dataIndex	: 'annotation',
		            filter		: 'string'
		        },
		        {
		            text		: "Tratamiento",
					flex		: 3,
		            sortable	: true,
		            dataIndex	: 'description',
		            filter		: 'list'
		        },
		        {
		            text		: "Fecha",
		            sortable	: true,
		            dataIndex	: 'date_annotation',
		        }
		    ],
		   dockedItems: [
				{
					xtype : 'toolbarCrud'
				},
				{
			        xtype 			: 'pagination',
			        store			: 'AnnotationsM5Store'
				}
			]
		}
	],
	buildWindow : function(){
		this.setWinObject(Ext.create('Admin.view.docentes.observador.AnnotationsM5View'));
	},
	showWindow	: function(btn){
		const me = this,
			data = btn.up('window').down('grid').getSelection()[0];

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
