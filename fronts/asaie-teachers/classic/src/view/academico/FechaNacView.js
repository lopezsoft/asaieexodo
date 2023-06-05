/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.FechaNacView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.FechaNacView',
    itemId      : 'FechaNacView',
    width       : 500,
    initComponent : function (param){
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleDatesOfBirth() + ' - ' + Global.getYear());
    },
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
                    xtype   : 'CbGrupo'
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
                        },
                        {
                            xtype       : 'customcheckboxfield',
                            itemId      : 'Ck',
                            boxLabel    : 'Odenar por fechas'
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