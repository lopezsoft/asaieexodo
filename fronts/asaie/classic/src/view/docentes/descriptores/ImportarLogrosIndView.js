/**
 * Created by LOPEZSOFT on 2/01/2016.
 */
Ext.define('Admin.view.docentes.ImportarLogrosIndView', {
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.ImportarLogrosIndView',
    title   : 'Importar',
    maximized: true,
    requires: [
        'Admin.store.docentes.ImportarLogrosIndStore'
    ],
    controller :  'logros',
    items   : [
        {
            xtype   : 'customgrid',
            iconCls : '',
            store   : 'ImportarLogrosIndStore',
            selType : 'checkboxmodel',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>',
                        '<p><b>Competencia:</b> {competencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            columns :  [
                {
                    xtype       : 'rownumberer'
                },
                {
                    text        : 'Descripción',
                    dataIndex   : 'descripcion',
                    flex        : 2
                },
                {
                    text        : 'Competencia',
                    dataIndex   : 'competencia',
                    flex        : 1,
                    filters     : 'list'
                },
                {
                    text        : 'Periodo',
                    dataIndex   : 'periodo',
                    filters     : 'list'
                },
                {
                    text		: "Tipo",
                    width		: 100,
                    dataIndex	: 'tipo',
                    renderer 	:  function(val) {
                        switch(val){
                            case 1 :
                                return '<span style="color:red;"> <b>' + 'COMPETENCIA' + '</b></span>';
                                break;
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
                }
            ],
            listeners: {
                resize: function (grid, width, height, oldWidth, oldHeight, eOpts ){

                    if (width <400) {
                        grid.getColumns()[4].setHidden(true);
                    }else {
                        grid.getColumns()[4].setHidden(false);
                    }
                },

                afterRender : function (grid) {
                    win = grid.up('window');
                    if (win.nType == 1){
                        grid.getColumns()[4].setHidden(true);
                    }
                }
            },
            dockedItems: [
                {
                    xtype   : 'customToolbar',
                    items : [
                        {
                            xtype   : 'checkbox',
                            boxLabel: 'Importar por desempeños',
                            itemId  : 'checkImport'
                        },
                        {
                            xtype   : 'customButton',
                            text    : 'importar',
                            itemId  : 'btnImport',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onClickImport'
                        },
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                },
                {
                    xtype   : 'pagination',
                    store   : 'ImportarLogrosIndStore'
                }
            ]
        }
    ]
});