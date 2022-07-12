Ext.define('Admin.view.academico.AsignaturasCertificadosFormView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.AsignaturasCertificadosFormView',
	maximized	: false,
	controller	: 'academico',
    maxHeight: 470,
    closeAction: 'hide',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewSubjects());
    },
    store: 'AsignaturaCertificadoStore',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'DATOS DE LA ASIGNATURA',
					items 	: [
						{
                            fieldLabel  : 'Nombre de la asignatura',
                            name        : 'nombre'
						},
                        {
                            fieldLabel  : 'Abreviatura',
							name		: 'abrev'
                        },
                        {
                            xtype       : 'customnumberfield',
                            fieldLabel  : 'I/H',
                            name		: 'ih'
                        },
                        {
                            xtype		: 'customradiogroup',
                            columns		: 1,
                            vertical	: true,
                            fieldLabel	: 'Estado',
                            items		: [
                                {
                                    boxLabel	: 'Activa',
                                    name		: 'estado',
                                    inputValue	: 1
                                },
                                {
                                    boxLabel	: 'Inactiva',
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