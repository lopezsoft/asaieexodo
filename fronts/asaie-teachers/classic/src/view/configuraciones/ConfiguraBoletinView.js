/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.ConfiguraBoletinView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.configuraboletinview',
    requires    : [
        'Admin.container.Accordion'
    ],
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Configuración boletines - '+ Global.getYear());
    },
    store       : 'ConfiguracionBoletinStore',
    items       : [
        {
            xtype       : 'customform',
            items: [    
                {   
                    xtype       : 'customTab',
                    items       : [
                        {   
                            title       : 'Firmas',
                            items   : [
                                {
                                    xtype       : 'fieldSet',
                                    title       : 'Mostrar firmas de:',
                                    items       : [
                                        {
                                            xtype       : 'customcheckboxfield',
                                            name        : 'firmarector',
                                            boxLabel    : 'Rector(a)'
                                        },
                                        {
                                            xtype       : 'customcheckboxfield',
                                            name        : 'firmasecre',
                                            boxLabel    : 'Secretario(a)'
                                        },
                                        {
                                            xtype       : 'customcheckboxfield',
                                            name        : 'firmacoor',
                                            boxLabel    : 'Coordinador(a)'
                                        },
                                        {
                                            xtype       : 'customcheckboxfield',
                                            name        : 'firmadirgrupo',
                                            boxLabel    : 'Director(a)  de grupo'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            title       : 'General',
                            items       : [
                                {
                                    xtype       : 'fieldSet',
                                    title       : 'Logros e indicadores',
                                    items       : [
                                        {
                                            xtype       : 'customradiogroup',
                                            vertical    : false,
                                            items       : [
                                                {
                                                    boxLabel    : 'Permitir digitar notas sin haber digitado logros - desempeños e indicadores de desempeño',
                                                    name        : 'permi_ind',
                                                    inputValue  : 1
                                                },
                                                {
                                                    boxLabel    : 'No permitir digitar notas sin haber digitado logros - Desempeños e indicadores de desempeño.',
                                                    name        : 'permi_ind',
                                                    inputValue  : 2
                                                },
                                                {
                                                    boxLabel    : 'Permitir digitar notas sin haber digitado logros, pero si indicadores de desempeño.',
                                                    name        : 'permi_ind',
                                                    inputValue  : 3
                                                },
                                                {
                                                    boxLabel    : 'No permitir digitar notas sin haber digitado logros, pero si indicadores de desempeño.',
                                                    name        : 'permi_ind',
                                                    inputValue  : 4
                                                },
                                                {
                                                    boxLabel    : 'Indiferente.',
                                                    name        : 'permi_ind',
                                                    inputValue  : 5
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    xtype       : 'customcheckboxfield',
                                    name        : 'bol_desem',
                                    boxLabel    : 'Mostrar boletin por desempeños.'
                                },
                                {
                                    xtype       : 'customcheckboxfield',
                                    name        : 'promedio',
                                    boxLabel    : 'Mostrar promedio.'
                                },
                                {
                                    xtype       : 'customcheckboxfield',
                                    name        : 'activeindica',
                                    boxLabel    : 'No mostrar INDICADORES para desenpeño ALTO Y SUPERIOR.'
                                },
                                {
                                    xtype       : 'customcheckboxfield',
                                    name        : 'activamsg',
                                    boxLabel    : 'Mostrar mensajes para LOGROS e INDICADORES.',
                                    reference   : 'cbMsg',
                                    publishes   : 'value'
                                },
                                {
                                    xtype       : 'TextField',
                                    name        : 'msglogro',
                                    fieldLabel  : 'Mensaje para logros',
                                    labelAlign  : 'top',
                                    bind    : {
                                        disabled    : '{!cbMsg.value}'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
