/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.view.estudiantes.EvaluacionesHistorialEstudiantesView',{
    extend	: 'Admin.base.WindowCrud',
    requires: [
        'Admin.store.estudiantes.EvaluacionesHistorialEstudiantesStore',
        'Admin.grid.CustomGrid'
    ],
    title	: 'Historial',
    alias 	: 'widget.EvaluacionesHistorialEstudiantesView',
    controller  : 'estudiantes',
    maximized   : true,
    items   : [
        {
            xtype       : 'customgrid',
            store		: 'EvaluacionesHistorialEstudiantesStore',
            iconCls     : '',
            selModel	: 'rowmodel',
            plugins		: [
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
            columns	: [
                {
                    xtype	: 'customrownumberer'
                },
                {
                    text        : 'Respuestas correctas',
                    width       : 165,
                    dataIndex   : 'res_verdaderas'
                },
                {
                    text 		: 'Respuestas incorrectas',
                    width 		: 165,
                    dataIndex	: 'res_falsas'
                },
                {
                    text 		: 'Respuestas abiertas',
                    width 		: 165,
                    dataIndex	: 'res_abiertas'
                },
                {
                    text 		: 'Hora inicio',
                    width 		: 150,
                    dataIndex	: 'hora_inicio'
                },
                {
                    text 		: 'Hora final',
                    width 		: 150,
                    dataIndex	: 'hora_final'
                },
                {
                    text 		: 'Minutos',
                    width 		: 80,
                    dataIndex	: 'tiempo'
                },
                {
                    text 		: 'Segundos',
                    width 		: 100,
                    dataIndex	: 'segundos'
                },
                {
                    text 		: 'Nota',
                    width 		: 80,
                    dataIndex	: 'punataje'
                },
                {
                    text 		: 'Intento',
                    width 		: 80,
                    dataIndex	: 'intento'
                }
            ],
            dockedItems: [
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar'
                },
                {
                    xtype       : 'customToolbar',
                    items       : [
                        '->',
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                }
            ]
        }
    ]
});
