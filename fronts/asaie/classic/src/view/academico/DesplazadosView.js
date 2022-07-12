/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.DesplazadosView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.DesplazadosView',
    itemId      : 'DesplazadosView',
    maxHeight   : 130,
    maxWidth    : 350,
    items   : [
        {
            xtype   : 'customform',
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