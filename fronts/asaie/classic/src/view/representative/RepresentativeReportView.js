var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'nombre'}
    ],
    data : [
        {id: '1',    nombre: 'CERTIFICADO ELECTORAL'},
        {id: '2',    nombre: 'LISTADO DE ESTUDIANTES'}
    ]
});


Ext.define('Admin.view.representative.RepresentativeReportView',{
    extend  : 'Admin.base.CustomWindow',
    alias   :'widget.representativereportview',
    title   : 'Reportes',
    controller  : 'representative',
    requires    : [
        'Admin.combo.CbGrados',
        'Admin.combo.CbSedes'
    ],
    maxHeight      : 250,
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 120
            },
            items   : [
                {
                    xtype   : 'CbSedes'
                },
                {
                    xtype   : 'CbGrados'
                },
                {
                    xtype       : 'ComboExpand',
                    itemId      : 'comboReport',
                    store       : store,
                    fieldLabel	: 'Tipo de reporte',
                    name		: 'id',
                    displayField: 'nombre',
                    valueField	: 'id',
                    reference 	: 'comboReport',
                    publishes   : 'value'
                }
            ],
            dockedItems : []
        }
    ],
    buttons : [
        {
            xtype       : 'printButton',
            disabled    : false,
            formBind    : true
        }
    ]
});
