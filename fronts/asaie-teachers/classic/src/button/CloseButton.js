Ext.define('Admin.button.CloseButton',{
	extend	: 'Admin.button.CustomButton',
	alias	: 'widget.closebutton',
	itemId	: 'closebutton',
    iconCls	: 'x-fa fa-arrow-circle-left',
    handler: function (btn) {
        var me = Admin.getApplication();
        if (btn.up('window')) {
            me.onCloseWin(btn);
        } else if (btn.up('form')) {
            btn.up('form').closeForm(btn);
        }else if(btn.up('tabpanel')){
            btn.up('tabpanel').closeView(btn);
        }else if(btn.up('panel')){
            btn.up('panel').getController().onCloseView();
        }
    },
    tooltip	    : 'Cerrar y volver a la ventana anterior',
    text        : 'Volver',
	ui          : 'header-red',
    iconAlign	: 'left'
});
