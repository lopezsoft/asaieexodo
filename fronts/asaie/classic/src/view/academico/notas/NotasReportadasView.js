Ext.define('Admin.view.academico.NotasReportadasView',{
    extend          : 'Admin.forms.CustomForm',
    alias           : 'widget.notasreportadas',
    itemId          : 'NotasReportadasView',
    controller      : 'academico',
    initComponent: function () {
        var me  = Admin.getApplication();
        me.onStore('general.GradosStore');
        me.onStore('admin.DocentesDirGrupoStore');
        me.onStore('general.PeriodosStore');
        this.setTitle(AppLang.getSTitleViewReportedNotes() + ' - ' + Global.getYear());
        this.callParent(arguments);
    },
    showSaveButton    : false,
    items: [
        {
            xtype: 'customgrid',
            flex: 2,
            title: 'ASIGNACIÓN ACADÉMICA',
            itemId  : 'gridCarga',
            store: 'DocentesDirGrupoStore',
            allowDeselect : true,
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
            columns: [
                {
                    xtype: 'customrownumberer'
                },
                {
                    text: 'DOCENTES',
                    dataIndex: 'nombres',
                    flex: 1,
                    filter: 'string'
                },
                {
                    text: 'Año',
                    dataIndex: 'year',
                    width: 55
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbarCrud',
                    items: [
                        {
                            xtype       : 'CbPeriodos',
                            width       : 160,
                            labelAlign  : 'left'
                        },
                        {
                            xtype   : 'printButton'
                        },
                        '->',
                        {
                            xtype: 'closebutton',
                            iconAlign	: 'left'
                        }
                    ]
                },
                {
                    xtype: 'pagination',
                    itemId: 'pToolbar'
                }
            ]
        }
    ]
});
