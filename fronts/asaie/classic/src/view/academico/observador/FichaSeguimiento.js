Ext.define('Admin.view.academico.FichaSeguimiento',{
    extend      : 'Admin.forms.CustomForm',
    controller  : 'academico',
    alias       : 'widget.fichaseguimiento',
    initComponent: function () {
        let me      = this;
        const store    = Ext.create('Admin.store.base.StoreUrl',{
            model       : 'Admin.model.docentes.EstudiantesModel',
            proxy   : {
				extraParams: {
					withObserver: 1
				},
                url : 'students/enrollment-list'
            },
            autoLoad    : true
        });

        me.items = [
            {
                xtype   : 'customgrid',
                store   : store,
                plugins		: [
                    {
                        ptype : 'gridfilters'
                    },
                    {
                        ptype			: 'gridSearch',
                        readonlyIndexes	: ['note'],
                        disableIndexes	: ['pctChange'],
                        flex			: 1,
                        autoFocus		: true,
                        independent		: true
                    }
                ],
                columns : [
                    {
                        xtype       : 'customrownumberer'
					},
					{
						dataIndex   : 'foto',
						text        : 'Imagen',
						width       : 80,
						renderer    : function (val) {
							let aVal;
							if (Ext.isEmpty(val)) {
								aVal = Global.getAvatarUnknoun();
							} else {
								aVal = val
							}
							return '<img alt="" height="48" width="48" src="'+aVal+'"/>';
						}
					},
                    {
                        text        : 'Apellidos y Nombres',
                        dataIndex   : 'nombres',
                        width       : 320,
                        filter      : 'string'
                    },
                    {
                        text        : 'Grado',
                        dataIndex   : 'grado',
                        width       : 200,
                        filter      : 'list'
                    },
                    {
                        text        : 'Grupo',
                        dataIndex   : 'id_group',
                        width       : 60,
                        filter      : 'list'
                    },
                    {
                        text        : 'Estado',
                        dataIndex   : 'estado_mat',
                        width       : 200,
                        filter      : 'list'
                    },
                    {
                        text        : 'Jornada',
                        dataIndex   : 'jornada',
                        width       : 120,
                        filter      : 'list'
                    },
                    {
                        text        : 'Sede',
                        dataIndex   : 'sede',
                        width       : 320,
                        filter      : 'list'
                    },
					{
						text        : 'Año',
						dataIndex   : 'year',
						width       : 60,
					}
                ],
                dockedItems : [
                    {
                       xtype    : 'toolbarCrud',
                        items   : [
                            '->',
                            {
                                xtype		: 'printButton'
                            },
                            '-',
                            {
                                xtype		: 'closebutton'
                            }
                        ]
                    },
                    {
                        xtype   : 'pagination'
                    }
                ]
            }
        ];
        me.callParent(arguments);
        me.setTitle('Ficha de seguimiento'+' - '+ Global.getYear());
    },
    itemId          : 'fichaseguimiento',
    showSaveButton  : false
});
