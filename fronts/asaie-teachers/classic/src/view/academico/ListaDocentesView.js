/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.ListaDocentesView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'ReportesAcademico',
    typeReport  : 0,
    requires    : [
        'Admin.store.admin.DocentesDirGrupoStore'
    ],
    alias       : 'widget.ListaDocentesView',
    itemId      : 'ListaDocentesView',
    height      : '100%',
    width       : 650,
    initComponent : function (param){
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewTeachers() + ' - ' + Global.getYear());
    },
    items   : [
        {
            xtype	: 'customgrid',
            iconCls : '',
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
                    mode            : 'remote',
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
                    if (me.up('window').down('#Ck')) {
                        me.up('window').down('#Ck').setDisabled(!selected.length);
                        if (selected.length == 0){
                            me.up('window').down('#Ck').setValue(false);
                        }
                    }
                }
            },
            dockedItems : [
                {
                    xtype 		: 'pagination',
                    itemId      : 'pToolbar',
                    displayInfo: false,
                    showPrint : true
                }
            ]
        }
    ]
});
