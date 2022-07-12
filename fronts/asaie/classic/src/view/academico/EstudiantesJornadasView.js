/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.EstudiantesJornadasView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.EstudiantesJornadasView',
    itemId      : 'EstudiantesJornadasView',
    maxHeight   : 130,
    maxWidth    : 350,
    initComponent: function (param) {  
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitlSstudentsPerDay() + ' - '+ Global.getYear());
    },
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