/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.AsignacionAcadView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'ReportesAcademico',
    typeReport  : 0,
    requires    : [
        'Admin.combo.CbSedes',
        'Admin.combo.CbGrados',
        'Admin.store.admin.DocentesDirGrupoStore'
    ],
    initComponent : function (param){
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewCourses() + ' - ' + Global.getYear());
    },
    maximized   : true,
    alias       : 'widget.AsignacionAcadView',
    itemId      : 'AsignacionAcadView',
    items       : [
        {
            xtype   : 'customform',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items   : [
                {
                    xtype   : 'customform',
                    flex    : 4,
                    items   : [
                        {
                            xtype	: 'customgrid',
                            title	: 'LISTA DOCENTES',
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
                                    itemId		: 'pToolbar',
                                    displayInfo : false,
                                    showExport  : false
                                }
                            ]
                        }
                    ],
                    dockedItems : [
                    ]
                },
                {
                    xtype   : 'customform',
                    title   : 'Lista de asignación por grados',
                    flex    : 3,
                    defaults : {
                        labelWidth	: 60
                    },
                    items   : [
                        {
                            xtype   : 'CbSedes'
                        },
                        {
                            xtype   : 'CbGrados',
                            bind    : {
                                visible : '{comboSedes.value}'
                            }
                        }
                    ],
                    dockedItems : [
                        {
                            xtype   : 'customToolbar',
                            dock	: 'bottom',
                            items   : [
                                {
                                    xtype   : 'printButton',
                                    disabled: false
                                },
                                {
                                    xtype   : 'customcheckboxfield',
                                    boxLabel: 'Imprimir selección',
                                    itemId  : 'Ck',
                                    disabled: true
                                }
                            ]
                        }
                    ]
                }
            ],
            dockedItems : [
            ]
        }
    ]
});
