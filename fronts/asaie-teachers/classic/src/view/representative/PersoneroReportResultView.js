/**
 * Created by LOPEZSOFT on 20/02/2016.
 */
/**
 * Created by LOPEZSOFT on 20/02/2016.
 */

var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'nombre'}
    ],
    data : [
        {id: '1',    nombre: 'RESULTADO GLOBAL'},
        {id: '2',    nombre: 'RESULTADO POR MESAS'},
        {id: '3',    nombre: 'ACTA DE ELECCIONES'}
    ]
});


Ext.define('Admin.view.representative.PersoneroReportResultView',{
    extend  : 'Admin.base.CustomWindow',
    alias   :'widget.PersoneroReportResultView',
    title   : 'Reportes de resultado representative',
    controller  : 'representative',
    requires    : [
        'Admin.combo.CbGrados',
        'Admin.combo.CbSedes'
    ],
    height      : 150,
    width       : 480,
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelWidth  : 120
            },
            items   : [
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