/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.promocion.ActaPromocionEstaView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.ActaPromocionEstaView',
    itemId      : 'ActaPromocionEstaView',
    controller  : 'Promocion',
    maxHeight      : 200,
    maxWidth       : 430,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Actas de promoción estadísticas - '+ Global.getYear());
    },
    items   : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype   : 'customcheckboxfield',
                    boxLabel: 'Por grados',
                    itemId  : 'CkGrado'
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