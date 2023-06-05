Ext.define('Admin.view.configuraciones.CarnetsInfo',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
	alias       : 'widget.carnetsinfo',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle('Info adicional - '+ Global.getYear());
	},
	store		: 'CarnetsStore',
	maxHeight	: 450,	
    items       : [
        {
            xtype   		: 'customform',
            items: [
                {
                    xtype		: 'customhtmleditor',
                    labelAlign  : 'top',
					name		: 'info',
					height		: 250,
					fieldLabel	: 'Información adicional'
                }
            ]
        }
    ]
});
