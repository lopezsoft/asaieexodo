Ext.define('Admin.base.WindowCrud' ,{
    extend: 'Ext.window.Window',
	requires: [
        'Admin.field.FieldSet',
        'Admin.toolbar.ToolbarSave',
        'Admin.button.CloseButton',
        'Admin.button.FacebookButton',
		'Admin.field.YearField',
		'Ext.grid.filters.Filters',
		'Admin.grid.CustomGrid',
        'Admin.container.CustomContainer',
        'Admin.field.CustomText'
    ],
    modal			: true,
	width			: 700,
	alias			: 'widget.windowCrud',
    border			: false,
	minHeight		: 150,
	height			: '100%',
    maximizable 	: true,
    animCollapse	: false,
    constrainHeader	: true,
    closeAction 	: 'destroy',
    layout			: 'fit',
    defaultFocus    : 'customtext',
    autoShow		: false,
	config			: {
		winObject	: undefined,
		app			: undefined,
		store		: undefined,
		modalView	: undefined,
		record		: undefined,
		records		: undefined,
		reloadStore	: false,
		autoSave	: true,
	},
	initComponent	: function(){
    	this.callParent(arguments);
    	this.on({
			scope	: this
		})
	},
	constructor : function (config) {
    	this.callParent(arguments);
		this.app	= Admin.getApplication();
		this.initConfig(this.config, config);
		this.on('cancel',function (me) {

        });
		this.on('closed',function (me) {

        });
	},
	/**Destructor*/
	onDestroy : function(){
		if (this.getWinObject()){
			this.winObject.destroy();
		}
		this.callParent(arguments);
	},

	/**Constructor de ventanas*/
	buildWindow	: function(){
		var me	= this;
		if(me.getModalView()){
			me.setWinObject(Ext.create(me.getModalView()));
		}
	},

	/**Mostrador de ventanas*/
	showWindow	: function(btn){
		const me = this;
		if(me.getModalView()){
			const data = btn.up('window').down('grid').getSelection()[0];

			if(!me.getWinObject()){
				me.buildWindow();
			}
			const form 	= me.getWinObject().down('form');
			form.reset(true);
			if(btn.itemId === 'editButton'){
				form.loadRecord(data);
			}
			if(me.getRecord()){
				me.getWinObject().setRecord(me.getRecord());
			}
			if(me.getRecords()){
				me.getWinObject().setRecords(me.getRecords());
			}
			me.getWinObject().show();
		}
	},

	/**
	 * Funcion utilizada para guardar los cambios realizados en una tienda
	 * @param storeName Nombre de la tienda Donde se sincronizan los datos
	 * @param reload : Indica si se Recarga la tienda después de una inserción de registros
	 */

	onSave	: function(){
		const me = this,
			store = this.getStore();
		if (store) {
			this.saveData(store, me.getReloadStore());
		}
	},

	saveData	: function(storeName,reload){
		const me = this.getApp(),
			win = this,
			ts = this,
			form = win.down('form'),
			record = form.getRecord(),
			values = form.getValues(),
			store = Ext.getStore(storeName);
		const autoSave = ts.getAutoSave();
		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				win.mask('Guardando...');
			}
			record.set(values);
			if(!autoSave) {
				this.onClose(win);
				return false;
			}
			store.sync({
				success : function(batch, o) {
					me.showResult('Se han guardado los datos');
					win.unmask();
					if (reload === true){
						store.reload();
					}
					ts.afterSave();
					win.close();
				},
				failure	: function (re) {
					win.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
			win.mask('Guardando...');
			store.insert(0,values);
			if(!autoSave) {
				this.onClose(win);
				return false;
			}
			store.sync({
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					win.unmask();
					ts.afterSave();
					win.close();
					if (reload === true){
						store.reload();
					}
				},
				failure	: function (re) {
					store.rejectChanges();
					win.unmask();
				}
			});
		}
	},

	onClose: function (win) {
		win.unmask();
		win.close();
	},

	/**
	 * Se ejecuta luego de guardar los cambios
	 */
	afterSave	: function() {
		// console.log('afterSave');
	},

	/**
	 * Funcion utilizada para carcelar los cambios realizados en una tienda
	 * @param store Donde se sincronizan los datos
	 * @param reload : Indica si se recarga la tienda luedo de carcelar los cambios
	 */
	cancelChanges : function(store,reload){
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

    doDestroy: function () {
        Ext.un(this.resizeListeners);
        this.callParent();
    },

    onViewportResize: function () {
        this.syncSize();
    },

    syncSize: function () {
        var width = Ext.Element.getViewportWidth(),
            height = Ext.Element.getViewportHeight();

        // We use percentage sizes so we'll never overflow the screen (potentially
        // clipping buttons and locking the user in to the dialog).

        this.setSize(Math.floor(width * 0.9), Math.floor(height * 0.9));
        this.setXY([ Math.floor(width * 0.05), Math.floor(height * 0.05) ]);
    }
 });
