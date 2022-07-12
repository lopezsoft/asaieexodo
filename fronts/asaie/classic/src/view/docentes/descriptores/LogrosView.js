/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.view.docentes.LogrosView', {
    extend: 'Admin.base.WindowCrud',
    title	: 'Logros o desempeños académicos',
    alias 	: 'widget.LogrosView',
    width   : 650,
    controller  : 'logros',
    maximized   : true,
    ntype       : 0,
    requires : [
        'Admin.store.general.DesempenosStore',
        'Admin.view.docentes.LogrosNewView',
        'Admin.view.docentes.IndicadoresNewView',
        'Admin.view.docentes.ImportarLogrosIndView',
        'Admin.store.general.CompetenciasStore',
        'Admin.store.docentes.LogrosStore'
    ],
    items : [
        {
            xtype 		: 'customgrid',
            store		: 'LogrosStore',
            border		: false,
            iconCls     : '',
            scrollable  : true,
            plugins: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>',
                        '<p><b>Periodo:</b> {periodo}</p>',
                        '<p><b>Competencia:</b> {competencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: false,
                    independent		: true
                }
            ],
            columns: [
                {
                    xtype   : 'rownumberer'
                },
                {
                    text		: "Descripción",
                    flex		: 2,
                    sortable	: true,
                    dataIndex	: 'descripcion',
                    filter		: 'string'
                },
                {
                    text        : 'Competencia',
                    flex		: 1,
                    sortable	: true,
                    dataIndex	: 'competencia',
                    filter		: 'list'
                },
                {
                    text		: "Periodo",
                    width		: 77,
                    sortable	: true,
                    dataIndex	: 'periodo',
                    filter		: 'list'
                },
                {
                    text		: "Desempeño",
                    width		: 102,
                    dataIndex	: 'desempeño',
                    filter		: 'list',
                    renderer 	:  function(val) {
                        return '<span style="color:#7e55ef;"> <b>' + val + '</b></span>';
                    }
                },
                {
                    text		: "Tipo",
                    width		: 100,
                    dataIndex	: 'tipo',
                    renderer 	:  function(val) {
                        switch(val){
                            case 2:
                                return '<span style="color:red;"> <b>' + 'LOGRO' + '</b></span>';
                                break;
                            case 3:
                                return '<span style="color:Orangered;"> <b>' + 'INDICADOR' + '</b></span>';
                                break;
                            case 4:
                                return '<span style="color:Darkviolet;"> <b>' +'FORTALEZA' + '</b></span>';
                                break;
                            case 5:
                                return '<span style="color:Steelblue;"> <b>' + 'DIFICULTAD' + '</b></span>';
                                break;
                            default	:
                                return '<span style="color:black;"> <b>' +'NO APLICA'+ '</b></span>';
                                break;
                        }

                        return val;
                    }
                },
                {
                    text		: "Año",
                    width		: 55,
                    dataIndex	: 'año'
                }
            ],
            listeners :{
                resize : function (grid, width, height, oldWidth, oldHeight, eOpts) {
                    if (width <= 400) {
                        grid.getColumns()[4].setHidden(true);
                        grid.getColumns()[5].setHidden(true);
                        grid.getColumns()[7].setHidden(true);
                    }else if (width <=700) {
                        grid.getColumns()[4].setHidden(true);
                        grid.getColumns()[5].setHidden(false);
                        grid.getColumns()[7].setHidden(true);
                    }else {
                        grid.getColumns()[4].setHidden(false);
                        grid.getColumns()[5].setHidden(false);
                        grid.getColumns()[7].setHidden(false);
                    }
                },
                afterrender : function (grid) {
                    var xStore      = Ext.getStore('LanguageStore'),
                        xMenu       = xStore.getAt(1).data.children[0].children,
                        me          = this;

                    me.down('#btnImport').setText(xMenu[2].description);
                    me.down('#btnImportBanco').setText(xMenu[3].description);
                    me.down('#btnImportYear').setText(xMenu[4].description);
                    me.down('#btnImport').setTooltip(xMenu[2].tooltips);
                    me.down('#btnImportBanco').setTooltip(xMenu[3].tooltips);
                    me.down('#btnImportYear').setTooltip(xMenu[4].tooltips);
                }
            },
            dockedItems: [
                {
                    xtype : 'toolbarCrud'
                },
                {
                    xtype   : 'customToolbar',
                    items   : [
                        {
                            xtype   : 'ContainerListData'
                        },'-',
                        {
                            xtype   : 'customButton',
                            text    : 'Importar - Parcelador',
                            itemId  : 'btnImport',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onViewImport'
                        },'-',
                        {
                            xtype   : 'customButton',
                            text    : 'Importar - Banco',
                            itemId  : 'btnImportBanco',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onViewImportBanco',
                            disabled: true
                        },
                        {
                            xtype   : 'customButton',
                            text    : 'Importar - año anterior',
                            itemId  : 'btnImportYear',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onViewImportYear'
                        }
                    ]
                },
                {
                    xtype   : 'pagination',
                    store   : 'LogrosStore',
                    dock    : 'bottom'
                }
            ]
        }
    ]
});