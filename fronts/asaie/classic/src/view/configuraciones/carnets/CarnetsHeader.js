Ext.define('Admin.view.configuraciones.CarnetsHeader',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
	alias       : 'widget.carnetsheader',
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
					name		: 'header',
					height		: 250,
					fieldLabel	: 'Información de encabezado'
                }
            ]
        }
    ]
});
