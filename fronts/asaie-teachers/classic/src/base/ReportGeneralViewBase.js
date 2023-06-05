/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
Ext.define('Admin.base.ReportGeneralViewBase',{
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.ReportGeneralViewBase',
    controller  : 'ReportesAcademico',
    requires: [
        'Admin.combo.CbGrados',
        'Admin.container.SedesJorn',
        'Admin.combo.CbGrupo'
    ],
    initComponent: function () { 
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleReports()+' - '+Global.getYear())
    },
    maxHeight   : 350,
    maxWidth    : 650,
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 80
            },
            items   : [
                {
                    xtype   : 'sedesJorn',
                    defaults: {
                        labelWidth  : 80
                    }
                },
                {
                    xtype   : 'CbGrupo',
                    itemId  : 'cbGrupos'
                }
            ],
            dockedItems : [
                {
                    xtype   : 'toolbarSave',
                    items 	: [
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        },
                        '->',
                        {
                            xtype	    : 'printButton',
                            disabled 	: false
                        },'-',
                        {
                            xtype	: 'closebutton',
                            itemId	: 'btnUndo',
                            iconAlign	: 'left'
                        }
                    ]
                }
            ]
        }
    ]
});