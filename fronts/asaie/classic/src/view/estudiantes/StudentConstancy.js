Ext.define('Admin.view.estudiantes.StudentConstancy',{
    extend      : 'Admin.base.CustomWindow',
    alias       : 'widget.studentconstancy',
    title       : 'estudiantes',
    itemId      : 'studentconstancy',
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
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Tipo de reporte',
                    columns     : 2,
                    vertical    : true,
                    labelStyle	: 'font-weight:bold',
                    itemId      : 'hType',
                        items   : [
                        {
                            boxLabel  : 'Modelo 1',
                            name      : 'modelo',
                            inputValue: '1',
                            checked   : true
                        },
                        {
                            boxLabel  : 'Modelo 1',
                            name      : 'modelo',
                            inputValue: '2'
                        }
                    ]
                }
            ],
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