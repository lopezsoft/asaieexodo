Ext.define('Admin.button.PrintButton',{
	extend		: 'Admin.button.CustomButton',
	alias		: 'widget.printButton',
	xtype		: 'printButton',
    tooltip 	: 'Generar informe',
    itemId		: 'printButton',
    iconCls		: 'x-fa fa-print',
    disabled 	: true,
    menu 		: [
    	{
			text	: 'Generar en archivo PDF',
			iconCls	: 'x-fa fa-file-pdf-o',
			itemId	: 'btnPdf',
			handler	: 'onSetReport'
		},
		{
			text	: 'Generar en archivo Excel',
			iconCls	: 'x-fa fa-file-excel-o',
			itemId	: 'btnXls',
			handler	: 'onSetReport'
		},
		{
			text	: 'Generar en archivo Word',
			iconCls	: 'x-fa fa-file-word-o',
			itemId	: 'btnRtf',
			handler	: 'onSetReport'
		},
		// {
		// 	text: 'Generar en archivo Word',
		// 	iconCls: 'x-fa fa-file-word-o',
		// 	itemId: 'btnDoc',
		// 	handler: 'onSetReport'
		// },
		{
			text	: 'Generar en archivo POWER POINT',
			iconCls	: 'x-fa fa-file-powerpoint-o',
			itemId	: 'btnPptx',
			handler	: 'onSetReport'
		},
		// {
		// 	text	: 'Generar en archivo HTML',
		// 	iconCls	: 'x-fa fa-html5',
		// 	itemId	: 'btnHtml',
		// 	handler	: 'onSetReport'
		// },
		{
			text	: 'Generar en archivo delimitado (CSV)',
			iconCls	: 'x-fa fa-file-excel-o',
			itemId	: 'btnCsv',
			handler	: 'onSetReport'
		}
    ]
});