
Ext.define('Admin.view.academico.NivelacionesPeriodicas',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'academico',
    alias       : 'widget.nivelacionesperiodicas',
    xtype       : 'nivelacionesperiodicas',
    itemId      : 'NivelacionesPerView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Actividades de apoyo periódicas - '+ Global.getYear());
    },
    items   : [
        {
            xtype	: 'customgrid',
            selModel: 'rowmodel',
            itemId  : 'gridDocente',
            plugins		: [
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype : 'responsive'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    flex			: 1,
                    autoFocus		: true,
                    independent		: true
                }
            ],
            store   : 'DocentesDirGrupoStore',
            columns: [
                {
                    xtype		: 'customrownumberer'
                },
                {
                    text        : 'DOCENTES',
                    dataIndex   : 'nombres',
                    flex        : 1,
                    filter  	: 'string'
                }
            ],
            listeners : {
                'selectionchange': function(grid, selected) {
					const me = this;
					if (me.up('window').down('#btnActa')) {
                        me.up('window').down('#btnActa').setDisabled(!selected.length);
                    }
                    if (me.up('window').down('#btnNotas')) {
                        me.up('window').down('#btnNotas').setDisabled(!selected.length);
                    }
                }
            },
            dockedItems : [
				{
					xtype       : 'pagination',
					showPrint   : false,
				},

                {
                    xtype   : 'customToolbar',
                    dock    : 'bottom',
                    items   :[
                        '->',
                        {
                            xtype   : 'customButton',
                            text    : 'Digitar notas',
                            iconCls : 'x-fa fa-plus',
                            disabled: true,
                            itemId  : 'btnNotas',
                            handler : function (btn) {
								const win 		= btn.up('window');
								const select 	= win.down('grid').getSelection()[0];
								let title		= 'Actividades de apoyo - ' + select.get('nombres');
								const store     = Ext.getStore('RecuperacionesPeriodicasStore');
								if (store && store.getCount() > 0) {
									store.removeAll();
								}
                                Ext.create('Admin.view.academico.NivelacionesPeriodicasView',{
                                    title   : title,
                                    record  : select,
                                }).show();
                            }
                        }
                    ]
                }
            ]
        }
    ]
});
