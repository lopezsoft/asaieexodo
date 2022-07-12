Ext.define('Admin.view.docentes.PeriodosDocentesView' ,{
    extend	: 'Admin.grid.CustomGrid',
    alias 	: 'widget.periodosdocentes',
    xtype 	: 'periodosdocentes',
    store	: 'PeriodosStore',
    title   : 'Periodos académicos',
    height  : 400,
    plugins	: [
        {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<p><b>Periodo:</b> {periodo}</p>',
                '<p><b>Descripción:</b> {descripcion_periodo}</p>'
            )
        },
        {
            ptype   : 'gridfilters'
        },
        {
            ptype   : 'responsive'
        }
    ],
    columns: [
    	{
			xtype	: 'customrownumberer'
		},
		{
			dataIndex   : 'periodo',
			text        : 'Periodo',
			width       : 75
		},
		{
			dataIndex   : 'descripcion_periodo',
			text        : 'Descripción del periodo',
			width       : 180
		},
		{
			text		: 'Grupo de grados',
			width		: 250,
			dataIndex 	: 'nombre_grado_agrupado'
		},
		{
			text	: 'Fechas del periodo',
			columns	: [
				{
					dataIndex   : 'fecha_inical',
					text        : 'Inicio',
					emptyCellText	: '0000-00-00',
					renderer		: Ext.util.Format.dateRenderer('Y-m-d'),
					field: {
						xtype: 'datefield',
						format: 'Y-m-d'
					},
					width       : 100
				},
				{
					dataIndex   : 'fecha_cierre',
					text        : 'Corte',
					emptyCellText	: '0000-00-00',
					renderer		: Ext.util.Format.dateRenderer('Y-m-d'),
					field: {
						xtype: 'datefield',
						format: 'Y-m-d'
					},
					width       : 100
				}
			]
		},
		{
			text	: 'Fechas de nivelación',
			columns : [
				{
					dataIndex	: 'fecha_inical_nivelacion',
					text		: 'Inicio',
					emptyCellText: '0000-00-00',
					renderer	: Ext.util.Format.dateRenderer('Y-m-d'),
					field: {
						xtype: 'datefield',
						format: 'Y-m-d'
					},
					width: 100
				},
				{
					dataIndex: 'fecha_cierre_nivelacion',
					text: 'Corte',
					width: 100,
					emptyCellText: '0000-00-00',
					renderer: Ext.util.Format.dateRenderer('Y-m-d'),
					field: {
						xtype: 'datefield',
						format: 'Y-m-d'
					}
				}
			]
		},
		{
			text        : 'Porcentaje',
			dataIndex   : 'porciento',
			width       : 100
		},
		{
			xtype       : 'checkcolumn',
			text        : 'Bloquear',
			dataIndex   : 'bloquear',
			width       : 90,
			disabled	: true
		},
		{
			dataIndex   : 'year',
			text        : 'Año',
			width		: 60
		},
		{
			xtype       : 'checkcolumn',
			text        : 'Activo',
			dataIndex   : 'estado',
			width       : 70,
			disabled	: true
		}
    ],
    tbar: [
        {
            xtype   : 'facebookButton'
        },
        {
            xtype   : 'youtubeButton'
        }
    ]
});
