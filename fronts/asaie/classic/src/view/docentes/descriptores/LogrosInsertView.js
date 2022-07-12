/**
 * Created by LOPEZSOFT on 03/12/2015.
 */
Ext.define('Admin.view.docentes.LogrosInsertView',{
    extend : 'Admin.base.WindowCrud',
    alias  	: 'widget.LogrosInsertView',
    title	: 'Logros',
    width	: 600,
    requires: [
        'Admin.view.docentes.controller.CargaController',
        'Admin.store.docentes.LogrosStore'
    ],
    maximized : true,
    controller 	: 'carga',
    items 	: [
        {
            xtype 		: 'customgrid',
            store		: 'LogrosStore',
            iconCls     : '',
            plugins		: [
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
            selType : 'checkboxmodel',
            columns: [
                {
                  xtype     : 'rownumberer'
                },
                {
                    text    	: "Código",
                    width		: 75,
                    sortable	: true,
                    dataIndex	: 'consecutivo',
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

                    text		: "Periodo",
                    width		: 75,
                    sortable	: true,
                    dataIndex	: 'periodo'
                },
                {
                    text		: "Desempeño",
                    width		: 100,
                    dataIndex	: 'desempeño',
                    filter      : 'list',
                    renderer :  function(val) {
                        return '<span style="color:Darkviolet;"> <b>' +val+ '</b></span>';
                    }
                },
                {
                    text		: "Tipo",
                    width		: 100,
                    dataIndex	: 'tipo',
                    renderer 	:  function(val) {
                        switch(val){
                            case '1':
                                return '<span style="color:red;"> <b>' + 'LOGRO' + '</b></span>';
                                break;
                            case '2':
                                return '<span style="color:Orangered;"> <b>' + 'INDICADOR' + '</b></span>';
                                break;
                            case '3':
                                return '<span style="color:Darkviolet;"> <b>' +'FORTALEZA' + '</b></span>';
                                break;
                            case '4':
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
                    width		: 60,
                    dataIndex	: 'año'
                }
            ],
            listeners: {
                'selectionchange': function(grid, selected, eOpts) {
                    this.down('#btnSave').setDisabled(!selected.length);
                }
            },
            dockedItems: [
                {
                    xtype: 'toolbarSave'
                },
                {
                    xtype 			: 'pagination',
                    store			: 'LogrosStore'
                }
            ]
        }
    ]
});
