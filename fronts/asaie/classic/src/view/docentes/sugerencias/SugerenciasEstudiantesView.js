Ext.define('Admin.view.docentes.SugerenciasEstudiantesView', {
    extend      : 'Admin.base.CustomWindow',
    alias       : 'widget.SugerenciasEstudiantesView',
    title       : 'Sugerencias - Observaciones',
    controller: 'carga',
    items: [
        {
            xtype: 'customgrid',
            store: 'SugerenciasEstudiantesStore',
            plugins: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl: new Ext.XTemplate(
                        '<p><b>Descripción:</b> {sugerencia}</p>',
                        '<p><b>Periodo:</b> {periodo}</p>'
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
                    dataIndex: 'sugerencia',
                    filter: 'string'
                },
                {
                    text: "Tipo",
                    width: 110,
                    sortable: true,
                    dataIndex: 'tipo',
                    filter: 'list',
                    renderer: function(val) {
                        switch (val) {
                            case '3':
                                return '<span style="color:Darkviolet;">' + 'OBSERVACIÓN' + '</span>';
                                break;
                            default:
                                return '<span style="color:red;">' + 'SUGERENCIA' + '</span>';
                                break;
                        }
                        return val;
                    }
                }
            ],
            dockedItems: [{
                    xtype: 'pagination'
                },
                {
                    xtype: 'customToolbar',
                    items: [{
                            xtype   : 'deletebutton',
                            text    : 'Borrar',
                            tooltip : 'Haga Click para eliminar el registro seleccionado',
                            disabled: true,
                            handler : 'onDeleteSugEstudiantes'
                        }, '->', '-',
                        {
                            xtype: 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});