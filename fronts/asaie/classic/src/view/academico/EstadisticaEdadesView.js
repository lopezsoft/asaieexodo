/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.EstadisticaEdadesView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.EstadisticaEdadesView',
    itemId      : 'EstadisticaEdadesView',
    maxHeight   : 130,
    maxwidth    : 450,
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