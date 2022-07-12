/**
 * Created by LOPEZSOFT on 30/04/2016.
 */
Ext.define('Admin.view.estudiantes.perfil.PerfilEstudianteView',{
    extend : 'Admin.base.WindowCrud',
    alias   : 'widget.PerfilEstudianteView',
    title   : 'Perfil del estudiante',
    controller  : 'estudiantes',
    iconCls : 'x-fa fa-user',
    height  : 220,
    items   : [
        {
            xtype   : 'customform',
            defaultType : 'TextField',
            items   : [
                {
                    fieldLabel  : 'Nombre de usuario',
                    name        : 'nombre_usuario'
                },
                {
                    fieldLabel  : 'Contraseña',
                    name        : 'password_u',
                    inputType	: 'password',
                    itemId      : 'pasw1',
                    reference   : 'pasw1',
                    publishes   : 'value',
                    allowBlank  : true,
                    listeners   : {
                        change : function (t, n, o) {
                            if (Ext.isEmpty(n)) {
                                t.up('window').down('#pasw2').allowBlank = true;
                            }else{
                                t.up('window').down('#pasw2').allowBlank = false;
                            }
                        }
                    }
                },
                {
                    fieldLabel  : 'Confirmar contraseña',
                    inputType	: 'password',
                    itemId      : 'pasw2',
                    name        : 'pasw2',
                    allowBlank  : true,
                    bind        : {
                        visible  : '{pasw1.value}'
                    }
                }
            ]
        }
    ]
});