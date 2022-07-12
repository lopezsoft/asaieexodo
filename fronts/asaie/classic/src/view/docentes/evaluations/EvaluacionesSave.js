Ext.define('Admin.view.docentes.EvaluacionesSave',{
    extend          : 'Admin.base.SaveWindow',
    alias  	        : 'widget.evaluacionessave',
    xtype  	        : 'evaluacionessave',
    defaultFocus    : 'customtext',
    controller      : 'actividades',
	store		    : 'EvaluacionesStore',
	reloadStore		: true,
    items 	: [
        {
            xtype       : 'customform',
            defaultType : 'customnumberfield',
            items   : [
                {
                    xtype       : 'customtext',
                    name        : 'nombre',
                    fieldLabel  : 'Nombre de la evaluación'
                },
                {
                    xtype       : 'customhtmleditor',
                    enableFont	: true,
                    name        : 'descripcion',
                    fieldLabel  : 'Descripción'
                },
                {
                    xtype   : 'customcontainer',
                    items   : [
                        {
                            xtype       : 'customnumberfield',
                            name        : 'num_preguntas',
                            maxValue    : 25,
                            fieldLabel  : 'Número de preguntas',
                            value       : 10
                        },
                        {
                            xtype       : 'customnumberfield',
                            fieldLabel  : 'Preguntas por página',
                            maxValue    : 5,
                            name        : 'paginas',
                            value       : 1
                        }
                    ]
                },
                {
                    xtype   : 'customcontainer',
                    items   :[
                        {
                            xtype       : 'customnumberfield',
                            name        : 'intentos',
                            fieldLabel  : 'Intentos permitidos',
                            maxValue    : 3,
                            value       : 1
                        },
                        {
                            xtype       : 'customnumberfield',
                            name        : 'tiempo',
                            fieldLabel  : 'Tiempo en minutos',
                            value       : 10
                        }
                    ]
                },
                {
                    xtype   : 'customcontainer',
                    items   : [
                        {
                            xtype       : 'customdate',
                            fieldLabel  : 'Disponible desde',
                            name        : 'fecha'
                        },
                        {
                            xtype       : 'customtime',
                            fieldLabel  : 'Hora',
                            name        : 'hora_apertura'
                        }
                    ]
                },
                {
                    xtype   : 'customcontainer',
                    items   : [
                        {
                            xtype       : 'customdate',
                            fieldLabel  : 'Disponible hasta',
                            name        : 'fecha_cierre'
                        },
                        {
                            xtype       : 'customtime',
                            fieldLabel  : 'Hora',
                            name        : 'hora_cierre'
                        }
                    ]
                },
                {
                    xtype       : 'CbPeriodos',
                    labelWidth	: 180
                },
                {
                    xtype       : 'customradiogroup',
                    fieldLabel  : 'Registro de notas',
                    items       : [
                        {
                            boxLabel    : 'El docente digita la nota manualmente',
                            name        : 'auto_calificar',
                            inputValue  : 0
                        },
                        {
                            boxLabel    : 'Digitar la nota automáticamente cuando el estudiante termine la evaluación',
                            name        : 'auto_calificar',
                            inputValue  : 1
                        }
                    ]
                }
            ]
        }
    ]
});
