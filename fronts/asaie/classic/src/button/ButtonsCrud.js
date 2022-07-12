Ext.define('Admin.button.ButtonsCrud',{
	extend	: 'Admin.button.CustomButton',
	alias	: 'widget.addButton',
	xtype	: 'addbutton',
    itemId	: 'addButton',
    iconCls	: 'far fa-plus-square',
    text	: 'Crear',
    tooltip	: 'Permite agregar un nuevo registro en la base de datos',
    ui		: 'header-blue',
    iconAlign: 'left',
    handler: function (btn) {
        if (btn.up('window')) {
            btn.up('window').showWindow(btn);
        } else if(btn.up('form')) {
            btn.up('form').showWindow(btn);
        }else if(btn.up('tabpanel')){
            btn.up('tabpanel').showWindow(btn);
        }
    }
});

Ext.define('Admin.button.EditButton',{
	extend	: 'Admin.button.CustomButton',
	alias	: 'widget.editButton',
	xtype	: 'editbutton',
    itemId	: 'editButton',
    text	: 'Editar',
    iconCls	: 'fas fa-edit',
    tooltip	: 'Permite editar el registro seleccionado',
    disabled	: true,
    ui		    : 'header-green',
    iconAlign	: 'left',
    handler: function (btn) {
        if (btn.up('window')) {
            btn.up('window').showWindow(btn);
        } else if(btn.up('form')) {
            btn.up('form').showWindow(btn);
        }else if(btn.up('tabpanel')){
            btn.up('tabpanel').showWindow(btn);
        }
    }    
});

Ext.define('Admin.button.DeleteButton',{
	extend	: 'Admin.button.CustomButton',
	alias	: 'widget.deletebutton',
    itemId	: 'deletebutton',
    iconCls	: 'fas fa-trash-alt',
    text	: 'Borrar',
    tooltip	: 'Permite borrar de la base de datos el registro seleccionado',
    disabled: true,
    handler : 'onGridDelete',
    ui		: 'header-red',
    iconAlign	: 'left'
});

Ext.define('Admin.button.FacebookButton',{
    extend	: 'Admin.button.CustomButton',
    alias	: 'widget.facebookButton',
    xtype	: 'facebookbutton',
    itemId	: 'facebookButton',
    iconCls	: 'fab fa-facebook-square',
    tooltip	: 'Ayuda en Facebook',
    ui      : 'facebook-header',
    href    : 'https://www.facebook.com/lopezsoft.com.co/videos'
});

Ext.define('Admin.button.YoutubeButton',{
    extend	: 'Admin.button.CustomButton',
    alias	: 'widget.youtubeButton',
    xtype	: 'youtubebutton',
    itemId	: 'youtubeButton',
    iconCls	: 'fab fa-youtube',
    tooltip	: 'Ayuda en YouTube',
    ui      : 'header-red',
    href    : 'https://www.youtube.com/playlist?list=PLdooI-heLtt0KSrRLrcT8dO2R5MFqJSYU'
});



