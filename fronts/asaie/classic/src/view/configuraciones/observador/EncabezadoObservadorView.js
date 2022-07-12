/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.EncabezadoObservadorView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.EncabezadoObservadorView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Encabezado observador - '+ Global.getYear());
    },
    store           : 'EncabezadoObservadorStore',
    defaultFocus    : 'customhtmleditor',
    items       : [
        {
            xtype   : 'customform',
            items: [
                {
                    xtype   : 'customhtmleditor',
                    name    : 'encabezado',
                    fieldLabel  : 'Encabezado',
                    labelAlign  : 'top'
                },
                {
                    xtype   : 'customhtmleditor',
                    name    : 'cuerpo',
                    fieldLabel  : 'Cuerpo',
                    labelAlign  : 'top'
                },
                {
                    xtype   : 'customtextarea',
                    name    : 'firma',
                    fieldLabel  : 'Lugar y fecha de expedición',
                    labelAlign  : 'top'
                }
            ]
        }
    ]
});