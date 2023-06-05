Ext.define('Admin.view.configuraciones.Configuraciones' ,{
    extend	: 'Admin.base.WindowCrud',
    alias	: 'widget.configuraciones',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Configuración general - '+ Global.getYear());
	},
	showWindow : function(btn){
		var
			rec	= btn.up('window').down('grid').getSelection()[0];
		win		= Ext.create('Admin.view.configuraciones.ConfiguraGeneralView');
		form	= win.down('form');
		if(btn.xtype	=== 'editButton'){
			form.loadRecord(rec);
			win.setRecord(rec);
		}else{
			win.setRecord(null);
			form.reset(true);
		}
		win.show();
	},
	store	: 'ConfiguracionesStore',
	items	: [
		{
			xtype       : 'customgrid',
			columnLines : true,
			store       : 'ConfiguracionesStore',
			columns : [
				{
					xtype   : 'customrownumberer'
				},
				{
					dataIndex   : 'nombre_grado_agrupado',
					text        : 'Grupo de grados en la configuración',
					flex       	: 1
				},
				{
					dataIndex   : 'year',
					width       : 60,
					text        : 'Año'
				}
			],
			dockedItems : [
				{
					xtype   : 'toolbarCrud'
				},
				{
					xtype 		: 'pagination',
					itemId		: 'pToolbar'
				}
			]
		}
	]
 });
