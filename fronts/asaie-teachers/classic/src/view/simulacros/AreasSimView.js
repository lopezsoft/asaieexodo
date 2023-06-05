Ext.define('Admin.view.simulacros.AreasSimView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.AreasSimView',
	maximized	: true,
	controller	: 'Simulacros',
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
                            name        : 'nombre'
						},
                        {
                            fieldLabel  : 'Abreviatura',
							name		: 'abrev'
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