/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.MatriculadosView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.MatriculadosView',
    itemId      : 'MatriculadosView',
    initComponent: function (params) {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleStudentRegistered() + ' - ' + Global.getYear());
    },
    maxHeight   : 350,
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 80
            },
            items   : [
                {
                    xtype: 'sedesJorn',
                    defaults: {
                        labelWidth  : 80
                    }
                },
                {
                    xtype   : 'CbGrupo',
                    itemId  : 'cbGrupos'
                },
                {
                    xtype   : 'customcheckboxfield',
                    itemId  : 'ckAcud',
                    boxLabel: 'Listado con firma acudiente'
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