/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.academico.FichaMatriculaView',{
    extend      : 'Admin.base.ReportGeneralViewBase',
    alias       : 'widget.FichaMatriculaView',
    itemId      : 'FichaMatriculaView',
    initComponent : function (params) {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleRegistrationSheet()+' - '+ Global.getYear());
    }
});