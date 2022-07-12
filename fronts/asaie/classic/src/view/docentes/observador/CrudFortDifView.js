Ext.define('Admin.view.docentes.observador.CrudFortDifView' ,{
    extend	: 'Admin.base.WindowCrud',
    requires: [
    	'Admin.store.docentes.observador.FortDifStore',
		'Admin.store.docentes.observador.ModelosStore'
    ],
    alias 	: 'widget.CrudFortDifView',
	controller	: 'observador',
    width 	: 650,
    height	: 550,
    items : [
    	{
		    xtype   	: 'customgrid',
		    store		: 'FortDifStore',
			iconCls		: '',
		    plugins		: [
			    {
		            ptype: 'rowexpander',
		            rowBodyTpl : new Ext.XTemplate(
		                '<p><b>Descripción:</b> {descripcion}</p>'
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
		            text		: "Descripción",
		            flex		: 3,
		            sortable	: true,
		            dataIndex	: 'descripcion',
		            filter		: 'string'
		        },
		        {
		            text		: "Tipo",
		            width		: 60,
		            sortable	: true,
		            dataIndex	: 'tipo',
		            filter		: 'list'
		        },
		        {
		            text		: "Fecha",
		            width		: 90,
		            sortable	: true,
		            dataIndex	: 'fecha'
		        }
		    ],
		   dockedItems: [
				{
					xtype : 'toolbarCrud'
				},
				{
			        xtype 			: 'pagination',
			        store			: 'FortDifStore'
				}
			]
		}
	]
});