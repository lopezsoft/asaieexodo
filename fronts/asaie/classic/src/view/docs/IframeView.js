/**
 * Created by LOPEZSOFT2 on 24/04/2017.
 */
Ext.define('Admin.view.docs.IframeView',{
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.iframeView',
    closable        : false,
    iconCls			: '',
    constrainHeader	: false,
    fixed           : true,
    hideShadowOnDeactivate : false,
    animateShadow   : true,
    border      : false,
    resizable   : true,
    bodyBorder  : false,
    cls         : 'menu-win',
    width       : 600,
    height      : 450,
    maximizable : false,
    header      : false,
    alwaysOnTop	: true,
    constructor : function (config) {
        var me  = this;
        Ext.apply(me.config, config);
        this.callParent(arguments);
        me.on('cancel',function (me) {

        });
        return me;
    },
    dockedItems: [
        {
            xtype	: 'toolbar',
            cls     : 'color-tool',
            dock	: 'top',
            items   : [
                ,'->',
                {
                    xtype   : 'closebutton',
                    iconCls :'x-fa fa-sign-out',
                    ui      : 'header-red',
                    handler: function (btn) {
                        var
                            app = Admin.getApplication(),
                            me  = btn.up('window');
                        me.fireEvent('cancel',me);
                        app.onCloseWin(btn);
                    }
                }
            ]
        }
    ]
});
