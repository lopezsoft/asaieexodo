
Ext.define('Admin.view.academico.NivelacionesPeriodicas',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'academico',
    alias       : 'widget.nivelacionesperiodicas',
    xtype       : 'nivelacionesperiodicas',
    itemId      : 'NivelacionesPerView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Actividades de apoyo preriódicas - '+ Global.getYear());
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
                    mode            : 'local',
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
                'selectionchange': function(grid, selected, eOpts) {
                    var me = this;
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
                                var	
                                    select	= btn.up('window').down('grid').getSelection()[0];
                                stitle	= 'Actividades de apoyo - '+select.get('nombres');
                                Ext.create('Admin.view.academico.NivelacionesPeriodicasView',{
                                    title   : stitle,
                                    record  : select
                                }).show();
                            }
                        }
                    ]
                }
            ]
        }
    ]
});
