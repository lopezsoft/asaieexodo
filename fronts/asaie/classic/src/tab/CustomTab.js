Ext.define('Admin.tab.CustomTab',{
    extend      : 'Ext.tab.Panel',
    alias       : 'widget.customTab',
    xtype       : 'customtab',
    width       : '100%',
    height      : '100%',
    cls         : 'shadow',
    frame       : true,
    activeTab   : 0,
    defaults: {
        bodyPadding : 1,
        scrollable  : true
    },
    config: {
        winObject       : undefined,
        app             : undefined,
        modalView		: undefined,
		record		    : undefined
    },
    closeView : function (btn) {
        this.returnMainCard();
    },
    returnMainCard: function () { 
        var
            cont = this.getController();
        if (cont) {
            cont.onRestoreMainCardPanel();
        }
    },    
    constructor: function (config) {
        this.callParent(arguments);
        this.app = Admin.getApplication();
        this.initConfig(this.config, config);
    },
    /**Destructor*/
    onDestroy: function () {
        if (this.getWinObject()) {
            this.winObject.destroy();
        }
        this.callParent(arguments);
    },
    /**Constructor de ventanas*/
    buildWindow: function () {
        var me	= this;
		if(me.getModalView()){
			me.setWinObject(Ext.create(me.getModalView()));
		}
    },
    /**Mostrador de ventanas*/
    showWindow: function (btn) {
        var me	= this;
        if(me.getModalView()){
			var 
				data	= btn.up('tabpanel').down('grid').getSelection()[0];
			
			if(!me.getWinObject()){
				me.buildWindow();
			}
			form 	= me.getWinObject().down('form'),
			form.reset(true);
			if(btn.itemId == 'editButton'){
				form.loadRecord(data);
			}
			if(me.getRecord()){
				me.getWinObject().setRecord(me.getRecord());
			}
			me.getWinObject().show();
		}
    }
});