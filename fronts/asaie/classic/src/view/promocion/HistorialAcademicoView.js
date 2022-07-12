/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.promocion.HistorialAcademicoView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.HistorialAcademicoView',
    itemId      : 'HistorialAcademicoView',
    controller  : 'Promocion',
    height      : 150,
    width       : 430,
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 80
            },
            items   : [
                {
                    xtype   : 'CbGrados',
                    fieldLabel	: 'Grado inicial:'
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