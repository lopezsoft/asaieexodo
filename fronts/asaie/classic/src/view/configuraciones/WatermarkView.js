Ext.define('Admin.view.configuraciones.WatermarkView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias	: 'widget.watermarkView',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Marca de agua en reportes');
	},
	showWindow : function(btn){
		const rec = btn.up('window').down('grid').getSelection()[0];
		let win = Ext.create('Admin.view.configuraciones.WatermarkForm');
		form	= win.down('form');
		if(btn.xtype	=== 'editButton'){
			form.loadRecord(rec);
			win.setRecord(rec);
			win.down('#watermark_file').allowBlank = true;
		}else{
			win.down('#watermark_file').allowBlank = false;
			win.setRecord(null);
			form.reset(true);
		}
		win.show();
	},
	store	: 'WatermarkStore',
	items	: [
		{
			xtype       : 'customgrid',
			columnLines : true,
			store       : 'WatermarkStore',
			columns : [
				{
					xtype   : 'customrownumberer'
				},
				{
					dataIndex   : 'uuid',
					text        : 'UUID',
					flex       	: 1
				},
				{
					dataIndex   : 'file_description',
					flex       	: 1,
					text        : 'Descripción'
				},
				{
					dataIndex   : 'url',
					text        : 'Imagen',
					width       : 70,
					renderer    : function (val) {
						let aVal;
						if (Ext.isEmpty(val)) {
							aVal = Global.getAvatarUnknoun();
						} else {
							aVal = val
						}
						return '<a href="'+aVal+'" target="_blank"><img alt="{competencia}" height="48" width="48" src="'+aVal+'"/><a/>';
					}
				},
				{
					xtype       : 'checkcolumn',
					text        : 'Activo',
					dataIndex   : 'state',
					width       : 100
				},
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
