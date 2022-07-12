Ext.define('Admin.view.representative.PersoneroContainerView',{
    extend  : 'Ext.container.Container',
    controller  : 'representative',
    alias   	: 'widget.personeroContainerView',
    layout: 	'responsivecolumn' ,
    items   : [
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Reportes',
                    iconCls : 'x-fa fa-print',
                    handler : 'onPrint'
                }
            ]
        },
        {
            xtype   : 'containerButton',
            items   : [
                {
                    xtype   : 'buttonPanel',
                    text    : 'Resultados',
                    iconCls : 'x-fa fa-print',
                    handler : 'onResult'
                }
            ]
        }
    ]
});
