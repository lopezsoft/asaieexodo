/**
 * Created by LOPEZSOFT on 30/04/2016.
 */
Ext.define('Admin.view.doncentes.perfil.PerfilDocenteView',{
    extend : 'Admin.base.WindowCrud',
    alias   : 'widget.PerfilDocenteView',
    title   : 'Perfil del docente',
    controller  : 'docentes',
    iconCls : 'x-fa fa-user',
    defaultFocus    : 'TextFieldUpper',
    height  : 600,
    items   : [
        {
            xtype   : 'customform',
            defaultType : 'TextFieldUpper',
            items   : [
                {
                    fieldLabel  : 'Primer apellido',
                    name        : 'apellido1'
                },
                {
                    fieldLabel  : 'Segundo apellido',
                    name        : 'apellido2',
                    allowBlank  : true
                },
                {
                    fieldLabel  : 'Primer nombre',
                    name        : 'nombre1'
                },
                {
                    fieldLabel  : 'Segundo nombre',
                    name        : 'nombre2',
                    allowBlank  : true
                },
                {
                    fieldLabel  : 'Dirección residencial',
                    name        : 'direccion',
                    allowBlank  : true
                },
                {
                    xtype       : 'customnumberfield',
                    fieldLabel  : 'Celular',
                    name        : 'movil',
                    allowBlank  : true
                },
                {
                    xtype       : 'customnumberfield',
                    fieldLabel  : 'Teléfono fijo',
                    name        : 'fijo',
                    allowBlank  : true
                },
                {
                    xtype       : 'TextField',
                    fieldLabel  : 'Correo electróncio',
                    name        : 'e_mail',
                    vtype       : 'email',
                    emptyText   : 'example@email',
                    allowBlank  : true
                },
                {
                    xtype       : 'TextField',
                    fieldLabel  : 'Contraseña',
                    name        : 'pasw',
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
                            t.up('window').down('#pasw2').setHidden(Ext.isEmpty(n) ? true : false);
                        }
                    }
                },
                {
                    xtype       : 'TextField',
                    fieldLabel  : 'Confirmar contraseña',
                    inputType	: 'password',
                    itemId      : 'pasw2',
                    name        : 'pasw2',
                    hidden      : true,
                    allowBlank  : true
                }
            ]
        }
    ]
});