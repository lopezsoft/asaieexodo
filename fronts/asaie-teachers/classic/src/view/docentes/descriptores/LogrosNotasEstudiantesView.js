/**
 * Created by LOPEZSOFT on 13/01/2016.
 */
Ext.define('Admin.view.docentes.LogrosNotasEstudiantesView', {
    extend: 'Admin.base.CustomWindow',
    alias: 'widget.LogrosNotasEstudiantesView',
    title: 'Logros e indicadores de desempeño',
    controller: 'carga',
    items: [{
        xtype: 'customgrid',
        store: 'LogrosNotasEstudiantesStore',
        plugins: [{
                ptype: 'rowexpander',
                rowBodyTpl: new Ext.XTemplate(
                    '<p><b>Descripción:</b> {descripcion}</p>',
                    '<p><b>Periodo:</b> {periodo}</p>',
                    '<p><b>Competencia:</b> {competencia}</p>'
                )
            },
            {
                ptype: 'gridfilters'
            },
            {
                ptype: 'gridSearch',
                readonlyIndexes: ['note'],
                disableIndexes: ['pctChange'],
                mode: 'local',
                flex: 1,
                autoFocus: false,
                independent: true
            }
        ],
        features: [{
            ftype: 'grouping',
            groupHeaderTpl: 'ESTUDIANTE: {name} (Total {rows.length})',
            hideGroupedHeader: false,
            startCollapsed: true,
            id: 'restaurantGrouping'
        }],
        columns: [{
                xtype: 'rownumberer'
            },
            {
                text: "Descripción",
                flex: 2,
                sortable: true,
                dataIndex: 'descripcion',
                filter: 'string'
            },
            {
                text: 'Competencia',
                width: 250,
                sortable: true,
                dataIndex: 'competencia',
                filter: 'list'
            },
            {
                text: "Desempeño",
                width: 102,
                dataIndex: 'nombre_escala',
                filter: 'list',
                renderer: function(val) {
                    return '<span style="color:#7e55ef;"> <b>' + val + '</b></span>';
                }
            },
            {
                text: "Tipo",
                width: 100,
                dataIndex: 'nombre_proceso',
                renderer: function(val) {
                    return '<span style="color:Darkviolet;"> <b>' + val + '</b></span>';
                }
            }
        ],
        dockedItems: [{
                xtype: 'pagination'
            },
            {
                xtype: 'customToolbar',
                items: [{
                        xtype: 'deletebutton',
                        text: 'Borrar',
                        tooltip: 'Haga Click para eliminar el registro seleccionado',
                        disabled: true,
                        handler: 'onDeleteLogEstudiantes'
                    }, '->', '-',
                    {
                        xtype: 'closebutton'
                    }
                ]
            }
        ]
    }]
});