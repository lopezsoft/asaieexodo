Ext.define('Admin.view.academico.AreasView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.AreasFormView',
	maximized	: false,
    controller: 'academico',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleNewEdit()+' '+AppLang.getSTitleViewAreas());
    },
    store: 'AreasStore',
    closeAction: 'hide',
    maxHeight  : 400,
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'DATOS DEL ÁREA',
					items 	: [
						{
                            fieldLabel  : 'Nombre del área',
                            name        : 'area'
						},
                        {
                            fieldLabel  : 'Abreviatura',
							name		: 'abrev'
                        },
                        {
                            xtype       : 'customnumberfield',
                            fieldLabel  : 'Orden',
                            name        : 'ordenar'
                        },
                        {
                            xtype		: 'customradiogroup',
                            columns		: 1,
                            vertical	: true,
                            fieldLabel	: 'Estado',
                            items		: [
                                {
                                    boxLabel	: 'Activo',
                                    name		: 'estado',
                                    inputValue	: 1
                                },
                                {
                                    boxLabel	: 'Inactivo',
                                    name		: 'estado',
                                    inputValue	: 0
                                }
                            ]
                        }
					]
				}
			]
		}		    
	]
});