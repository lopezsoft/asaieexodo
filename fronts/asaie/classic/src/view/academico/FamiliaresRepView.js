/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.FamiliaresRepView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.FamiliaresRepView',
    itemId      : 'FamiliaresRepView',
    initComponent : function (param){
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewFamilies() + ' - ' + Global.getYear());
    },
    requires: [
        'Admin.combo.CbTipoFamiliar'
    ],
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
                    xtype   : 'CbTipoFamiliar'
                },
                {
                    xtype   : 'customcheckboxfield',
                    itemId  : 'Ck',
                    boxLabel: 'Todos'
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