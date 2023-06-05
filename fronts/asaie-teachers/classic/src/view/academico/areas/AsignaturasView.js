Ext.define('Admin.view.academico.AsignaturasView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.AsignaturasFormView',
    controller: 'academico',
    maxHeight  : 500,
    store: 'AsignaturaStore',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleNewEdit()+' '+AppLang.getSTitleViewSubjects());
    },
    closeAction  : 'hide',
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
                            name        : 'asignatura'
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
                            fieldLabel	: 'Excluir de promoción final',
                            items		: [
                                {
                                    boxLabel	: 'Si',
                                    name		: 'excluir',
                                    inputValue	: 1
                                },
                                {
                                    boxLabel	: 'No',
                                    name		: 'excluir',
                                    inputValue	: 0
                                }
                            ]
                        },
                        {
                            xtype		: 'customradiogroup',
                            columns		: 2,
                            vertical	: true,
                            fieldLabel	: 'Electiva',
                            items		: [
                                {
                                    boxLabel	: 'Si',
                                    name		: 'electiva',
                                    inputValue	: 1
                                },
                                {
                                    boxLabel	: 'No',
                                    name		: 'electiva',
                                    inputValue	: 0
                                }
                            ]
                        },
                        {
                            xtype		: 'customradiogroup',
                            columns		: 2,
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