/**
 * Created by LOPEZSOFT on 17/05/2016.
 */
Ext.define('Admin.base.WinMenu',{
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.winmenu',
    ui      : 'win-menu',
    height  : 400,
    width   : 300,
    modal   : false,
    closable    : false,
    header      : false,
    iconCls			: '',
    constrainHeader	: false,
    title			: '',
    maximizable     : false,
    fixed       : true,
    hideShadowOnDeactivate : false,
    animateShadow   : true,
    border      : false,
    resizable   : false,
    bodyBorder  : false,
    cls         : 'menu-win',
    closeAction : 'hide',
    listeners : {
        beforeshow : function(win) {
            var  m   = Admin.getApplication().getMainView(),
                x   = m.width - (win.width + 10),
                y   = 64;
            win.setPosition(x,y);
        },
        focusleave : function (win) {
            win.hide();
        }
    }
});