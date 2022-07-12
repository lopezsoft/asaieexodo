/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.promocion.ActaPromocionView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.ActaPromocionView',
    itemId      : 'ActaPromocionView',
    controller  : 'Promocion',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Acta de promoción - '+ Global.getYear());
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
                        },'-',
                        {
                            xtype	: 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});