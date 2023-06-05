var store   = Ext.create('Ext.data.Store', {
    fields  : [
        { name : 'id'},
        { name : 'nombre'}
    ],
    data : [
        // {id: '1',    nombre: 'BOLETIN POR ÁREAS'},Habilitar
        // {id: '2',    nombre: 'BOLETIN POR ASIGNATURAS'},Habilitar
        // {id: '3',    nombre: 'BOLETIN POR COMPETENCIAS'},Habilitar
        // {id: '4',    nombre: 'MOD - PROY TRANSVERSALES'},
        // {id: '5',    nombre: 'BOLETIN POR ÁREAS MODELO Nº 2'}, Habilitar
        // {id: '6',    nombre: 'BOLETIN POR ASIGNATURAS  MODELO Nº 2'},
       // {id: '7',    nombre: 'BOLETIN POR ÁREAS CON ESTADÍISTICAS'},
       // {id: '8',    nombre: 'BOLETIN POR ASIGNATURAS CON ESTADÍISTICAS'}
       // {id: '9',    nombre: 'BOLETIN POR ÁREAS (SAMAC)'},
		{id: '10',    nombre: 'PRE-INFORME'},
		{id: '11',    nombre: 'NFORME POR DESEMPEÑOS'}
    ]
});

Ext.define('Admin.view.estudiantes.StudentNewsLetter',{
    extend      : 'Admin.base.CustomWindow',
    alias       : 'widget.studentnewsletter',
    title       : 'estudiantes',
    itemId      : 'studentnewsletter',
    controller  : 'estudiantes',
    maxHeight      : 300,
    maxWidth       : 480,
    items   : [
        {
            xtype           : 'customform',
            showSaveButton  : false,
            defaults: {
                labelWidth  : 120
            },
            items   : [
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
            ]
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