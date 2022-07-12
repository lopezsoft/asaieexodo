Ext.define('Admin.container.ContainerDescriptoresEscala',{
	extend	: 'Ext.container.Container',
	alias	: 'widget.Ext.container.Container',
	layout: {
		type: 'hbox'
	},
	items	: [
		{
			xtype	: 'hiddenfield',
			name	: 'id'
		},
		{
			xtype		: 'textarea',
			name      	: 'descriptor',
			fieldLabel	: 'Descripción',
			flex		: 1,
			allowBlank	: false,
			margin		: '0 1 1 1'
		},
		{
			xtype	: 'cbtipoprocesos',
			height	: '100%',
			name	: 'tipo_des'
		}
	]
});
