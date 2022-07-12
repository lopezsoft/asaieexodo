
Ext.define('Admin.button.ExportButton',{
    extend	: 'Ext.button.Button',
    alias	: 'widget.exportButton',
    tooltipType : 'title',
    tooltip 	: 'Exportar',
    itemId		: 'exportButton',
    iconCls		: 'x-fa fa-download',
    iconAlign	: 'left',
    ui			: 'header-green',
    text	    : 'Exportar',
    menu 		: [
       /* {
            text	: 'Excel',
            iconCls	: 'x-fa fa-file-excel-o',
            itemId	: 'btnExcel',
            handler	: 'onExportExcel'
        },*/
        {            text	: 'CSV',
            iconCls	: 'x-fa fa-file-o',
            itemId	: 'btnCSV',
            handler	: 'onExportCSV'
        }
    ]
});

Ext.define('Admin.button.SaveButton',{
    extend	    : 'Admin.button.CustomButton',
    iconCls	    : 'fas fa-save',
    tooltip	    : 'Guardar cambios',
    ui		    : 'header-blue',
    alias	    : 'widget.saveButton',
    tooltipType : 'title',
    iconAlign	: 'left',
    text	    : 'Guardar',
    formBind    : true,
    disabled 	: true,
    itemId      : 'saveButton',
    handler		: function (btn) {
        if (btn.up('window')) {
            btn.up('window').onSave(btn);
        } else if (btn.up('form')) {
            btn.up('form').onSave(btn);
        }			
    }
});

Ext.define('Admin.button.UndoButton',{
    extend	: 'Admin.button.CustomButton',
    iconCls	: 'x-fa fa-undo',
    tooltip	: 'Deshacer cambios',
    ui		: 'header-green',
    alias	: 'widget.undoButton',
	handler     : 'onClickUndo',
    tooltipType : 'title',
    iconAlign	: 'left',
    text	    : 'Deshacer',
    disabled 	: true,
    itemId      : 'undoButton'
});
