/**
 * Created by LOPEZSOFT on 11/02/2016.
 */
Ext.define('Admin.view.configuraciones.SaveProyCuposView',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.SaveProyCuposView',
    width       : 500,
    defaultFocus    : 'CbSedes',
    controller  : 'configuraciones',
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 80
            },
            items   : [
                {
                    xtype   : 'CbSedes'
                },
                {
                    xtype   : 'CbGrados'
                },
                {
                    xtype       : 'TextField',
                    name        : 'total',
                    fieldLabel  : 'Total cupos'
                },
                {
                    xtype       : 'customradiogroup',
                    fieldLabel  : 'Tipo proyección',
                    items       : [
                        {
                            inputValue  : 1,
                            boxLabel    : 'Nuevos',
                            name        : 'tipo'
                        },
                        {
                            inputValue  : 2,
                            boxLabel    : 'Antiguos',
                            name        : 'tipo'
                        }
                    ]
                },
                {
                    xtype       : 'yearField'
                }
            ]
        }
    ]
});