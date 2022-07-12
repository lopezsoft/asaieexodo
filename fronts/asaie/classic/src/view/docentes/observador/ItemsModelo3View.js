Ext.define('Admin.view.docentes.observador.ItemsModelo3View' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.itemsmodelo3view',
    xtype 	: 'itemsmodelo3view',
	controller	: 'observador',
	config		: {
		record	: null
	},
    items : [
    	{
		    xtype   	: 'customgrid',
		    store		: 'ItemsModelo3Store',
			features	: [
				{
					ftype:'grouping',
					groupHeaderTpl  : 'Aspecto : {name}',
					hideGroupedHeader   : false,
					startCollapsed      : true,
					id: 'restaurantGrouping'
				}
			],
		    plugins		: [
			    {
		            ptype: 'rowexpander',
		            rowBodyTpl : new Ext.XTemplate(
		                '<p><b>Criterio:</b> {criterio}</p>'
		           	)
		         },
		         {
				 	ptype : 'gridfilters'
				 }
		    ],
		    columns: [
		    	{
					xtype	: 'rownumberer'	
				},
		        {
		            text		: "CRITERIO",
		            width		: 350,
		            sortable	: false,
		            dataIndex	: 'criterio',
		            filter		: 'list'
		        },
				{
					text		: 'PERIODO 1',
					defaults	: {
						width	: 40,
						hideable: false,
						sortable: false,
						menuDisabled	: true
					},
					defaultType	: 'checkcolumn',
					columns		: [
						{
							text		: 'N',
							dataIndex	: 'n1',
							tooltip		: 'Nunca'
						},
						{
							text		: 'AV',
							dataIndex	: 'av1',
							tooltip		: 'Algunas veces'
						},
						{
							text		: 'CS',
							dataIndex	: 'cs1',
							tooltip		: 'Casi siempre'
						},
						{
							text		: 'S',
							dataIndex	: 's1',
							tooltip		: 'Siempre'
						}
					]
				},
				{
					text		: 'PERIODO 2',
					defaults	: {
						width	: 40,
						hideable: false,
						sortable: false,
						menuDisabled	: true
					},
					defaultType	: 'checkcolumn',
					columns		: [
						{
							xtype		: 'checkcolumn',
							text		: 'N',
							dataIndex	: 'n2',
							tooltip		: 'Nunca'
						},
						{
							xtype		: 'checkcolumn',
							text		: 'AV',
							dataIndex	: 'av2',
							tooltip		: 'Algunas veces'
						},
						{
							text		: 'CS',
							dataIndex	: 'cs2',
							tooltip		: 'Casi siempre'
						},
						{
							text		: 'S',
							dataIndex	: 's2',
							tooltip		: 'Siempre'
						}
					]
				},
				{
					text		: 'PERIODO 3',
					defaultType	: 'checkcolumn',
					defaults	: {
						width	: 40,
						hideable: false,
						sortable: false,
						menuDisabled	: true
					},
					columns		: [
						{
							text		: 'N',
							dataIndex	: 'n3',
							tooltip		: 'Nunca'
						},
						{
							text		: 'AV',
							dataIndex	: 'av3',
							tooltip		: 'Algunas veces'
						},
						{
							text		: 'CS',
							dataIndex	: 'cs3',
							tooltip		: 'Casi siempre'
						},
						{
							text		: 'S',
							dataIndex	: 's3',
							tooltip		: 'Siempre'
						}
					]
				},
				{
					text		: 'PERIODO 4',
					defaultType	: 'checkcolumn',
					defaults	: {
						width	: 40,
						hideable: false,
						sortable: false,
						menuDisabled	: true
					},
					columns		: [
						{
							text		: 'N',
							dataIndex	: 'n4',
							tooltip		: 'Nunca'
						},
						{
							text		: 'AV',
							dataIndex	: 'av4',
							tooltip		: 'Algunas veces'
						},
						{
							text		: 'CS',
							dataIndex	: 'cs4',
							tooltip		: 'Casi siempre'
						},
						{
							text		: 'S',
							dataIndex	: 's4',
							tooltip		: 'Siempre'
						}
					]
				}
		    ],
		   dockedItems: [
				{
					xtype : 'customToolbar',
					items : [
						{
							xtype	: 'facebookButton'
						},'-',
						{
							xtype	: 'youtubeButton'
						},'->',
						{
							xtype	: 'saveButton',
							handler : 'onSaveCriterios',
							disabled: false
						},'-',
						{
							xtype	: 'undoButton',
							// handler	: 'onUndoCriterios',
							disabled: false
						},'-',
						{
							xtype	: 'closebutton'
						}
					]
				},
				{
			        xtype 			: 'pagination',
			        store			: 'ItemsModelo3Store'
				}
			]
		}
	]
});
