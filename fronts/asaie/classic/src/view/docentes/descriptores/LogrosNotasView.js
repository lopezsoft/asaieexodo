/**
 * Created by LOPEZSOFT on 12/01/2016.
 */
Ext.define('Admin.view.docentes.LogrosNotasView',{
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.LogrosNotasView',
    title   : 'Logros',
    width   : 650,
    modal   : false,
    maximized   :  true,
    requires: [
        'Admin.store.docentes.LogrosNotasStore'
    ],
    items   : [
        {
            xtype   : 'customgrid',
            iconCls : '',
            store   : 'LogrosNotasStore',
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
                }
            ],
            columns: [
                {
                    xtype   : 'rownumberer'
                },
                {
                    text        : 'Código',
                    sortable	: true,
                    dataIndex   : 'consecutivo',
                    width       : 75,
                    filter		: 'list'
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
                    width		: 102,
                    sortable	: true,
                    dataIndex	: 'competencia',
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
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination',
                    store   : 'LogrosNotasStore'
                },
                {
                    xtype   : 'toolbar',
                    items   : [
                        {
                            xtype   : 'deletebutton'
                        }
                    ]
                }
            ]
        }
    ]
});