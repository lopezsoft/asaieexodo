/**
 * Created by LOPEZSOFT on 16/12/2015.
 */
Ext.define('Admin.view.docentes.BancoCliView', {
    extend: 'Admin.base.CustomWindow',
    alias : 'widget.BancoCliView',
    title : 'Banco de Logros, Indicadores, Fortalezas y debilidades',
    requires : [
        'Admin.store.docentes.BancoCliStore',
        'Admin.store.general.AsignaturasBancoStore'
    ],
    controller  : 'parcelador',
    maximized   : true,
    items: [
        {
            xtype   : 'customgrid',
            store   : 'BancoCliStore',
            autoLoad: false,
            iconCls : '',
            plugins : [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype : 'responsive'
                }
            ],
            selType : 'checkboxmodel',
            columns: [
                {
                    xtype   : 'rownumberer'
                },
                {
                    text        : 'Descripción',
                    dataIndex   : 'descripcion',
                    flex        : 2
                },
                {
                    text        : 'Periodo',
                    dataIndex   : 'periodo',
                    width       : 90
                }
            ],
            dockedItems: [
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar',
                    items 		: [
                        {
                            xtype 		: 'printButton'
                        }
                    ]
                },
                {
                    xtype   : 'toolbar',
                    items   : [
                        {
                            xtype       : 'Combo',
                            labelWidth  : 120,
                            fieldLabel  : 'Asignatura',
                            name		: 'id',
                            displayField: 'descripcion',
                            valueField	: 'id',
                            itemId		: 'CbAsignaturas',
                            store		: 'AsignaturasBancoStore',
                            reference   : 'asignaturas',
                            publishes   : 'value',
                            autoLoadOnValue : false,
                            flex    : 1,
                            listeners   : {
                                select : function (combo) {
                                    var win     = combo.up('window'),
                                        search  = win.lookupReference('btnSearch');
                                    search.setDisabled(false);
                                }
                            }
                        },'-',
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-search',
                            itemId  : 'btnSearch',
                            handler : 'onSearchImport',
                            disabled: true,
                            text    : 'Búscar...',
                            reference: 'btnSearch'
                        },'-',
                        {
                            xtype   : 'customButton',
                            iconCls : 'x-fa fa-upload',
                            itemId  : 'btnImport',
                            handler : 'onImport',
                            text    : 'Importar...',
                            disabled: true
                        },'-',
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});