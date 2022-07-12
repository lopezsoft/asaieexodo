Ext.define('Admin.view.general.perfil.UserProfilForm',{
    extend      : 'Admin.forms.CustomForm',
    alias       : 'widget.userprofilform',
    xtype       : 'userprofilform',
    controller  : 'base',
    iconCls     : 'x-fa fa-user', 
    fileStore   : 'general.perfil.UserStore',
    store       : 'UserStore',
    initComponent   : function(){
        let me  = this;
        me.items =  [
            {
                fieldLabel  : 'Nombre(s)',
                name        : 'names'
            },
            {
                fieldLabel  : 'Apellido(s)',
                name        : 'last_name'
            },
            {
                fieldLabel  : 'Nombre de usuario',
                name        : 'username'
            },
            {
                fieldLabel  : 'Correo electróncio',
                name        : 'email',
                vtype       : 'email',
                emptyText   : 'example@email'
            },
            {
                fieldLabel  : 'Contraseña',
                name        : 'pasw',
                inputType	: 'password',
                allowBlank  : true
            },
            {
                fieldLabel  : 'Confirmar contraseña',
                inputType	: 'password',
                name        : 'pasw2',
                allowBlank  : true
            }
        ];
        me.callParent();
        me.setTitle(AppLang.getSTitleViewProfile());
    },
    bodyPadding: 10,
    saveData: function (storeName, reload) {
        var me      = this.getApp(),
            win     = this,
            form    = this,
            record  = form.getRecord(),
            values  = form.getValues(),
            store   = Ext.getStore(storeName);
        if(values.pasw.length > 0 && values.pasw2.length > 0 ){
            if(values.pasw.length > 4 && values.pasw2.length > 4){
                if(Sha1.hash(values.pasw) === Sha1.hash(values.pasw2)){
                    values.password = Sha1.hash(values.pasw);
                }else{
                    me.showResult('Las contraseñas no coinciden.','error');
                    return false;
                }
            }else{
                me.showResult('La contraseña es muy corta.','warning');
                return false; 
            }
        }
        record.set(values);
        store.sync({
            success: function (batch, o) {
                me.showResult('Se han guardado los datos');
                if(values.password){
                    Ext.Ajax.request({
                        url		: Global.getUrlBase() + 'Account/LogOff',
                        method  : 'POST',
                        success: function(response){
                            localStorage.removeItem('oldRoute');
                            localStorage.removeItem('currentRoute');
                            window.location.reload();
                        },
                        failure: function (response) {
                            me.app.onAlert('No se puede cerrar la sesión');
                        }
                    });
                }
            },
            failure: function (re) {
                store.rejectChanges();
            },
            callback: function (b) {
                win.unmask();
            }
        });
    }
});