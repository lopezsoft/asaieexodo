Ext.define('Admin.view.widgets.WidgetE', {
    extend  : 'Ext.panel.Panel',
    xtype   : 'widget-e',
    ui      : 'panel-white',
    cls     : 'admin-widget-small sale-panel info-card-item info-card-small-wrap shadow',

    containerColor: '',

    // height: 130,
    height: 170,
    data: {
        amount  : 0,
        type    : '',
        icon    : ''
    },

    tpl: '<div><h2>{amount}</h2><div>{type}</div><span class="fas fa-{icon}"></span></div>',

    initComponent: function(){
        var me = this;

        Ext.apply(me, {
            cls: me.config.containerColor
        });

        me.callParent(arguments);
    }
});
