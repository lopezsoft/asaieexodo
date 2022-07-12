/**
 * Created by LOPEZSOFT2 on 18/09/2016.
 */
Ext.define('Admin.view.convivencia.reportes.EstadisticaReportView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.EstadisticaReportView',
    itemId  : 'EstadisticaReportView',
    maxWidth   : 450,
    maxHeight  : 350,
    controller : 'convivencia',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleStatistics()+' - ' + Global.getYear());
     },
    items   : [
        {
            xtype   : 'customform',
            defaults: {
                labelStyle	: 'font-weight:bold',
                labelWidth  : 125
            },
            items   : [
                {
                    xtype      	: 'CbNivelAcademico',
					name      	: 'nivel'
                },
                {
                    xtype      : 'fieldcontainer',
                    fieldLabel : 'Tipo de informe',
                    defaultType: 'radiofield',
                    defaults: {
                        flex: 1
                    },
                    layout: 'vbox',
                    items   : [
                        {
                            boxLabel  : 'General',
                            name      : 'informe',
                            inputValue: '1',
                            checked   : true,
                            itemId    : 'inf1'
                        },
                        {
                            boxLabel  : 'Solo perdidos',
                            name      : 'informe',
                            inputValue: '2',
                            itemId    : 'inf2'
                        }
                    ]
                },
                {
                    xtype       : 'checkboxgroup',
                    fieldLabel  : 'Todos los periodos',
                    items       : [
                        {
                            boxLabel    : '',
                            name        : 'allper',
                            inputValue  : '1',
                            id          : 'checkboxper',
                            reference   : 'allPer',
                            publishes   : 'value'
                        }
                    ]
                },
                {
                    xtype       : 'CbPeriodos',
                    width		: '100%',
                    bind        : {
                        visible : '{!allPer.value}'
                    }
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
