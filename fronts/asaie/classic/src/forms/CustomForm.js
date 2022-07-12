Ext.define('Admin.forms.CustomForm',{
    extend  : 'Ext.form.Panel',
    bodyPadding		: 5,
    scrollable      : true,		
    layout			: 'anchor',
    alias           : 'widget.customform',
    xtype           : 'customform',
    defaultFocus    : 'customtext',
    defaultType     : 'customtext',
    ui              : 'panel-white',
    cls             : 'wizardone shadow',
    margin          : 5,
    requires: [
        'Admin.field.FieldSet',
        'Admin.toolbar.ToolbarSave',
        'Admin.button.CloseButton',
        'Admin.grid.CustomGrid',
        'Admin.button.WebcamButton',
        'Admin.button.FacebookButton',
        'Admin.field.YearField',
        'Admin.container.CustomContainer',
        'Admin.field.CustomText'
    ],
    defaults: {
        width : '100%'
    },
    items   : [
    ],
    dockedItems: [{
        xtype		: 'toolbarSave'
    }],
    config: {
        winObject       : undefined,
        app             : undefined,
        store           : undefined,
        fileStore       : undefined,
        modalView		: undefined,
		record		    : undefined,
        showSaveButton  : true,
        showCloseButton : true,
        showUndoButton  : false
    },
    constructor: function (cfg) {
        var me = this;
        me.initConfig(cfg);
    },
    listeners: {
        afterrender: function (e) {
            var
                btn     = this.down('#saveButton'),
                btnC    = this.down('#closebutton'),
                btnU    = this.down('#undoButton');
            this.onCreateStore();
            if (btn) {
                btn.setVisible(this.getShowSaveButton());
            }
            if (btnU) {
                btnU.setVisible(this.getShowUndoButton());
            }
            if (btnC) {
                btnC.setVisible(this.getShowCloseButton());
            }
        },
        show : function(t,e){
        },
        activate : function(t,e){
        }
    },
    initComponent: function () {
        this.callParent(arguments);
        this.on({
            scope: this
        });
    },
    onCreateStore : function (){
        var
            store   = this.getFileStore(),
            me      = this;
        if (store) {
            cStore 	= 'Admin.store.'+store;
            Ext.require(cStore)
            Ext.onReady(function(){
                new Ext.create(cStore);
                me.onLoadStore();
            });
        }else{
            me.onLoadStore();
        }
    },
    onLoadStore : function (){
        var
            store   = this.getStore(),
            me      = this;
        if (store) {
            Ext.onReady(function(){
                xStore = Ext.getStore(store);
                if(xStore){
                    xStore.load({
                        scope: this,
                        callback: function (records, operation, success) {
                            if (records.length > 0) {                            
                                me.loadRecord(records[0]);
                            }
                        }
                    })
                }
            });
        }
    },
    closeForm: function (btn) {
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
	beforeEdit : function (){
		return true;
	},
    /**Mostrador de ventanas*/
    showWindow: function (btn) {
        var me	= this;
        if(me.getModalView()){
			var 
				data	= me.down('grid').getSelection()[0];
			
			if(!me.getWinObject()){
				me.buildWindow();
			}
			form 	= me.getWinObject().down('form'),
			form.reset(true);
			if(btn.itemId == 'editButton'){
				if(!me.beforeEdit()){
					return false;
				}
				form.loadRecord(data);
			}
			if(me.getRecord()){
				me.getWinObject().setRecord(me.getRecord());
            }
            me.getWinObject().animateTarget = btn;
			me.getWinObject().show();
		}
    },
	/**
	 * Funcion utilizada para guardar los cambios realizados en una tienda
	 * @param storeName Nombre de la tienda Donde se sincronizan los datos
	 * @param reload : Indica si se Recarga la tienda despues de una inserción de registros
	 */

    onSave: function (btn) {
        var
            store = this.getStore();
        if (store) {
            this.saveData(store);
        }
    },
    saveData: function (storeName, reload) {
        var me      = this.getApp(),
            win     = this,
            form    = this,
            record  = form.getRecord(),
            values  = form.getValues(),
            store   = Ext.getStore(storeName);

        if (store.getModifiedRecords().length > 0) {
            win.mask('Guardando...');
        }
        if (record) { //Edición
            record.set(values);
            store.sync({
                success: function (batch, o) {
                    me.showResult('Se han guardado los datos');
                },
                failure: function (re) {
                    store.rejectChanges();
                },
                callback: function (b) {
                    win.unmask();
                }
            });
        } else { // Insertar
            store.insert(0, values);
            store.sync({
                success: function (batch, o) {
                    me.showResult('Se han guardado los datos');
                    win.close();
                    if (reload == true) {
                        store.reload();
                    }
                },
                failure: function (re) {
                    store.rejectChanges();
                },
                callback: function (b) {
                    win.unmask();
                }
            });
        };
    },

	/**
	 * Funcion utilizada para carcelar los cambios realizados en una tienda
	 * @param store Donde se sincronizan los datos
	 * @param reload : Indica si se recarga la tienda luedo de carcelar los cambios
	 */
    cancelChanges: function (store, reload) {
        var 
            store   = this.getStore();
        if (store) {
            xStore   = Ext.getStore(store);
            xStore.rejectChanges();
            xStore.reload();
        }
	},
	
	afterRender: function () {
        var me = this;

        me.callParent(arguments);

        me.syncSize();

        // Since we want to always be a %age of the modalViewort, we have to watch for
        // resize events.
        Ext.on(me.resizeListeners = {
            resize: me.onViewportResize,
            scope: me,
            buffer: 50
        });
	},

	onViewportResize: function () {
        this.syncSize();
    },

    syncSize: function () {
		let me  	= this,
			win		= me.down('window'),
			height = Ext.Element.getViewportHeight();
		if(win) {
			// TODO: Pendiente
		}else{
			this.setMaxHeight(height - 148);
		}
    }
});
