/**
 * Created by LOPEZSOFT on 19/03/2016.
 */
var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'nombre'}
    ],
    data : [
        {id: '1',    nombre: 'BOLETIN POR ÁREAS'},
        {id: '2',    nombre: 'BOLETIN POR ASIGNATURAS'},
        {id: '3',    nombre: 'BOLETIN POR COMPETENCIAS'},
        {id: '4',    nombre: 'MOD - PROY TRANSVERSALES'},
        {id: '5',    nombre: 'BOLETIN POR ÁREAS MODELO Nº 2'},
        {id: '6',    nombre: 'BOLETIN POR ASIGNATURAS  MODELO Nº 2'},
        {id: '7',    nombre: 'BOLETIN POR ÁREAS CON ESTADÍISTICAS'},
        {id: '8',    nombre: 'BOLETIN POR ASIGNATURAS CON ESTADÍISTICAS'}
    ]
});

Ext.define('Admin.base.ReportViewBase',{
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.ReportViewBase',
    title   : 'Reportes',
    requires    : [
        'Admin.combo.CbGrados',
        'Admin.combo.CbSedes',
        'Admin.combo.CbGrupo',
        'Admin.combo.CbJornadas'
    ],
    height      : 400,
    width       : 480,
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
                    xtype   : 'CbGrupo'
                },
                {
                    xtype   : 'CbJornadas'
                },
                {
                    xtype   : 'CbPeriodos',
                    width 	: '100%'
                },
                {
                    xtype       : 'ComboExpand',
                    itemId      : 'comboReport',
                    store       : store,
                    fieldLabel	: 'Tipo de reporte',
                    name		: 'id_report',
                    displayField: 'nombre',
                    valueField	: 'id',
                    reference 	: 'comboReport',
                    publishes   : 'value'
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Tipo de papel',
                    columns     : 2,
                    vertical    : true,
                    labelStyle	: 'font-weight:bold',
                    itemId      : 'hType',
                        items   : [
                        {
                            boxLabel  : 'Hoja oficio',
                            name      : 'hoja',
                            inputValue: '1',
                            checked   : true,
                            itemId    : 'hOfico'
                        },
                        {
                            boxLabel  : 'Hoja carta',
                            name      : 'hoja',
                            inputValue: '2',
                            itemId    : 'oCarta'
                        }
                    ]
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