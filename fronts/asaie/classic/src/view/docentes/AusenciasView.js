/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.view.docentes.AusenciasView',{
    extend	: 'Admin.base.WindowCrud',
    requires: [
        'Admin.view.docentes.controller.AusenciasController',
        'Admin.store.docentes.AusenciasStore',
        'Admin.view.docentes.AusenciasWinView'
    ],
    title	: 'Ausencias académicas',
    alias 	: 'widget.AusenciasView',
    controller  : 'ausencias',
    maximized   : true,
    items   : [
        {
            xtype       : 'customgrid',
            store		: 'AusenciasStore',
            iconCls     : '',
            plugins		: [
                {
                    ptype		: 'rowexpander',
                    rowBodyTpl 	: new Ext.XTemplate(
                        '<p><b>Grado:</b> {grado}</p>',
                        '<p><b>Asignatura:</b> {asignatura}</p>',
                        '<p><b>Sede:</b> {sede}</p>',
                        '<p><b>Motivo:</b> {motivo}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            columns	: [
                {
                    xtype	: 'rownumberer'
                },
                {
                    text        : 'Nombres y apellidos',
                    width       : 280,
                    dataIndex   : 'nombres'
                },
                {
                    text 	: 'Curso',
                    columns : [
                        {
                            width 		: 105,
                            dataIndex	: 'grado'
                        },
                        {
                            width 		: 55,
                            dataIndex	: 'grupo',
                            filter		: 'list'
                        }
                    ]
                },
                {
                    text        : 'Motivo',
                    width       : 300,
                    dataIndex   : 'motivo'
                },
                {
                    text 		: 'Asignatura',
                    width 		: 250,
                    dataIndex	: 'asignatura',
                    filter		: 'list'
                },
                {
                    text 		: 'Tipo',
                    width 		: 120,
                    dataIndex	: 'tipo',
                    renderer 	:  function(val) {
                        var rVal;

                        switch (val) {
                            case '1' :
                                rVal    = '<span style="color:red;"> <b>Injustificada</b></span>';
                                break;
                            case '2' :
                                rVal    = '<span style="color:Darkviolet;"> <b>Justificada</b></span>';
                                break;
                            case '3' :
                                rVal    = '<span style="color:orange;"> <b>Retraso</b></span>';
                                break;
                            default :
                                rVal    = '<span style="color:red;"> <b>Injustificada</b></span>';
                                break
                        }
                        return rVal;
                    }
                },
                {
                    text 		: 'Fecha',
                    width 		: 95,
                    dataIndex	: 'fecha_falta'
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype   : 'toolbarCrud'
                }
            ],
            listeners :{
                resize: function (grid, width, height, oldWidth, oldHeight, eOpts ){
                    if (width <=700) {
                        grid.getColumns()[6].setHidden(true);
                    }else {
                        grid.getColumns()[6].setHidden(false);
                    }
                }
            }
        }
    ]
});
