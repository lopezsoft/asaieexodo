Ext.define('Admin.view.academico.CertificadosView',{
    extend      : 'Admin.view.academico.ConstanciasView',
    alias       : 'widget.certificados',
    itemId      : 'CertificadosView',
    initComponent: function () {
        var me  = Admin.getApplication();
        me.onStore('representative.CandidatesSearchStore');
        me.onStore('general.PeriodosStore');
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewStudyCertificates() + ' - ' + Global.getYear());
        this.down('#periodo').setHidden(false);
    }
});
