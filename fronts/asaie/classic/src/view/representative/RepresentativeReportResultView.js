var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'name'}
    ],
    data : [
        {id: '1',    name: 'RESULTADO GLOBAL POR CANDIDATOS'},
        {id: '2',    name: 'RESULTADO POR MESAS'},
        {id: '3',    name: 'RESULTADO VOTO EN BLANCO'}
    ]
});


Ext.define('Admin.view.representative.RepresentativeReportResultView',{
    extend  		: 'Admin.base.CustomWindow',
    alias   		:'widget.representativereportresultview',
    title   		: 'Reportes de resultados electorales',
    controller  	: 'representative',
    maxHeight      	: 200,
    maxWidth       	: 550,
    items   : [
        {
            xtype   		: 'customform',
			showSaveButton 	: false,
            defaults: {
                labelWidth  : 120
            },
            items   : [
                {
                    xtype       : 'ComboExpand',
                    itemId      : 'comboReport',
                    store       : store,
                    fieldLabel	: 'Tipo de informe',
                    name		: 'id',
                    displayField: 'name',
                    valueField	: 'id',
                    reference 	: 'comboReport',
                    publishes   : 'value'
                }
            ],
        }
    ],
    buttons : [
        {
            xtype       : 'printButton',
			disabled	: false
        }
    ]
});
