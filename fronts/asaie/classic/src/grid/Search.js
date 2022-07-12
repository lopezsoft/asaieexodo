Ext.define('Admin.grid.Search', {
    extend: 'Ext.AbstractPlugin',
    alias   : 'plugin.gridSearch',
    id      : 'gridSearch',
    uses: [
        'Ext.container.Container',
        'Ext.layout.container.HBox',
        'Ext.grid.Panel',
        'Ext.data.*',
        'Ext.button.Button',
        'Ext.menu.*',
        'Ext.form.field.Trigger'
    ],
    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {Boolean} autoFocus Try to focus the input field on each store load if set to true (defaults to undefined)
     */

    /**
     * @cfg {String} searchText Text to display on menu button
     */
    searchText: 'Buscar por',

    /**
     * @cfg {String} searchText Text to display on empty textfield
     */

    searchEmptyText: 'Escriba un texto para buscar',

    /**
     * @cfg {String} searchTipText Text to display as input tooltip. Set to '' for no tooltip
     */ 
    searchTipText: 'Escriba un texto para buscar y presione Enter',

    /**
     * @cfg {String} selectAllText Text to display on menu item that selects all fields
     */
    selectAllText: 'Seleccionar todo',

	/**
	 * @cfn (sting)
	 */
	searchLocalText :'Búsqueda local',

	/**
	 * @cfn (sting)
	 */
	searchRemoteText :'Búsqueda en el servidor',

    /**
     * @cfg {String} position Where to display the search controls. Valid values are top and bottom
     * Corresponding toolbar has to exist at least with mimimum configuration tbar:[] for position:top or bbar:[]
     * for position bottom. Plugin does NOT create any toolbar.(defaults to "bottom")
     */
    position: 'top',

    /**
     * @cfg {String} iconCls Icon class for menu button (defaults to "icon-magnifier")
     */
    iconCls: 'x-form-search-trigger', //'icon-magnifier',

    /**
     * @cfg {String/Array} checkIndexes Which indexes to check by default. Can be either 'all' for all indexes
     * or array of dataIndex names, e.g. ['persFirstName', 'persLastName'] (defaults to "all")
     */
    checkIndexes: 'all',

    /**
     * @cfg {Array} disableIndexes Array of index names to disable (not show in the menu), e.g. ['persTitle', 'persTitle2']
     * (defaults to [] - empty array)
     */
    disableIndexes: [],

    /**
     * Field containing search text (read-only)
     * @property field
     * @type {Ext.form.TwinTriggerField}
     */

    /**
     * @cfg {String} dateFormat How to format date values. If undefined (the default) 
     * date is formatted as configured in colummn model
     */

    /**
     * @cfg {Boolean} showSelectAll Select All item is shown in menu if true (defaults to true)
     */
    showSelectAll: true,

    /**
     * Menu containing the column module fields menu with checkboxes (read-only)
     * @property menu
     * @type {Ext.menu.Menu}
     */

    /**
     * @cfg {String} menuStyle Valid values are 'checkbox' and 'radio'. If menuStyle is radio
     * then only one field can be searched at a time and selectAll is automatically switched off. 
     * (defaults to "checkbox")
     */
    menuStyle: 'checkbox',

    /**
     * @cfg {Number} minChars Minimum characters to type before the request is made. If undefined (the default)
     * the trigger field shows magnifier icon and you need to click it or press enter for search to start. If it
     * is defined and greater than 0 then maginfier is not shown and search starts after minChars are typed.
     * (defaults to undefined)
     */

    /**
     * @cfg {String} minCharsTipText Tooltip to display if minChars is > 1
     */
    minCharsTipText: 'Escriba al menos {0} caracteres',

    /**
     * @cfg {String} mode Use 'remote' for remote stores or 'local' for local stores. If mode is local
     * no data requests are sent to server the grid's store is filtered instead (defaults to "remote")
     */

    mode: 'remote',

    /**
     * @cfg {Array} readonlyIndexes Array of index names to disable (show in menu disabled), e.g. ['persTitle', 'persTitle2']
     * (defaults to undefined)
     */

    /**
     * @cfg {Number} width Width of input field in pixels (defaults to 100)
     */
    width       : '100%',

    flex        : 1,

	minChars	: 1,

	toolBar		: {},

    /**
     * cfg {Boolean} dternima si se crea una barra independiente en el grid
     */

    independent : true,

    /**
     * @cfg {String} xtype xtype is usually not used to instantiate this plugin but you have a chance to identify it
     */

    /**
     * @cfg {Object} paramNames Params name map (defaults to {fields:"fields", query:"query"}
     */
    paramNames: {
        fields	: 'fields',
        query	: 'query'
    },

    /**
     * @cfg {String} shortcutKey Key to fucus the input field (defaults to r = Sea_r_ch). Empty string disables shortcut
     */
    shortcutKey: 'r',

    /**
     * @cfg {String} shortcutModifier Modifier for shortcutKey. Valid values: alt, ctrl, shift (defaults to "alt")
     */
    shortcutModifier: 'alt',

    /**
     * @cfg {Boolean} resetPage Resets the page and start properties to load 
     * page 1 if true (defaults to true)
     */
    resetPage: true,
    
    /**
     * @cfg {String} align "left" or "right" (defaults to "left")
     */

    /**
     * @cfg {Number} minLength Force user to type this many character before he can make a search 
     * (defaults to undefined)
     */

    /**
     * @cfg {Ext.Panel/String} toolbarContainer Panel (or id of the panel) which contains toolbar we want to render
     * search controls to (defaults to this.grid, the grid this plugin is plugged-in into)
     */

    constructor: function() {
        var me = this;
        
        me.callParent(arguments);
        me.mixins.observable.constructor.apply(this,arguments);
    },

    /**
     * @private
     * @param {Ext.grid.GridPanel/Ext.grid.EditorGrid} grid reference to grid this plugin is used for
     */
    init: function(grid) {
        this.grid = grid;

        // setup toolbar container if id was given
        if('string' === typeof this.toolbarContainer) {
            this.toolbarContainer = Ext.getCmp(this.toolbarContainer);
        }

        // do our processing after grid render and reconfigure
        grid.onRender = Ext.Function.createSequence(grid.onRender, this.onRender, this);
        grid.reconfigure = Ext.Function.createSequence(grid.reconfigure, this.reconfigure, this);

    },

    destroy : function () {

    },

    /**
     * adds plugin controls to <b>existing</b> toolbar and calls reconfigure
     * @private
     */
    onRender:function() {
        var me		= this,
			panel 	= me.toolbarContainer || me.grid;
        //var tb = 'bottom' === this.position ? panel.bottomToolbar : panel.topToolbar;

        //finds the toolbar that matches inte specified position in the 
        //docked items
        if (this.independent == true){
            var tb = Ext.create('Ext.toolbar.Toolbar',{ dock: this.position });
            this.grid.addDocked(tb);
        }else {
            var docked = panel.getDockedItems();
            for (var i = 0; i < docked.length; i++) {
                if (docked[i].dock == this.position && docked[i].componentCls == 'x-toolbar') {
                    var tb = docked[i];
                }
            }

            //if the toolbar isn't found, create one in the specified
            //position in the docked items
           if (!tb) {
                var tb = Ext.create('Ext.toolbar.Toolbar',{ dock: this.position });
                this.grid.addDocked(tb);
           }
        }

        this.menu = new Ext.menu.Menu();

        // handle position
        if('right' === this.align) { tb.add('->'); }
        else {
            if(0 < tb.items.getCount()) {
                if (tb.displayInfo) for (var i = 0; i < tb.items.getCount(); i++) {
                    if (tb.items.items[i] == tb.displayItem) {
                        tb.displayItem = tb.remove(tb.items.items[i],false);
                        tb.remove(tb.items.items[i-1]);
                        break;
                    }
                }
                tb.add('-');
            }
        }

        // add menu button
        tb.add(
        	{
				text    : this.searchText,
				menu    : this.menu,
				iconCls : this.iconCls,
				ui		: 'soft-blue'
			}
        );

        me.minChars = me.mode === 'local' ? 1 : 0;

        // add input field (TwinTriggerField in fact)
        //'Ext.form.field.Trigger'
        this.field = Ext.create('Admin.field.CustomText',{
            width           : this.width,
            flex            : this.flex,
            allowBlank 	    : true,
            emptyText 	    : this.searchEmptyText,
            selectOnFocus   : (undefined === this.selectOnFocus) ? true : this.selectOnFocus,
            triggers        : {
                trigger1 : {
                    cls   : 'x-form-clear-trigger',
                    handler : this.createDelegate(this.onTriggerClear, this)
                },
                trigger2 : {
                    cls  : (this.minChars) ? 'x-hide-display' : 'x-form-search-trigger',
                    handler : this.minChars ? Ext.emptyFn : this.createDelegate(this.onTriggerSearch, this)
                }
            },
            minLength       : this.minLength
        });
        
        // install event handlers on input field
        this.field.on('render', function() {
            // register quick tip on the way to search
            if((undefined === this.minChars || 1 < this.minChars) && this.minCharsTipText) {
                Ext.tip.QuickTipManager.register({
                    target: this.field.el,
                    text: this.minChars ? Ext.String.format(this.minCharsTipText, this.minChars) : this.searchTipText
                });
            }

            if(this.minChars) {
                this.field.el.on({scope:this, buffer:300, keyup:this.onKeyUp});
            }

            // install key map
            var map = new Ext.util.KeyMap(this.field.el, [{
                key: Ext.event.Event.ENTER,
                scope: this,
                fn: this.onTriggerSearch
            },{
                key: Ext.event.Event.ESC,
                scope: this,
                fn: this.onTriggerClear
            }]);
            map.stopEvent = true;
        }, this, {single:true});

        tb.add(this.field);

        // re-layout the panel if the toolbar is outside
        if(panel !== this.grid) {
            this.toolbarContainer.doLayout();
        }

        // reconfigure
        this.reconfigure();

        // keyMap
        if(this.shortcutKey && this.shortcutModifier) {
                var shortcutEl = this.grid.getEl();
                var shortcutCfg = [{
                    key:this.shortcutKey,
                    scope:this,
                    stopEvent:true,
                    fn:function() { this.field.focus(); }
                }];
                shortcutCfg[0][this.shortcutModifier] = true;
                this.keymap = new Ext.util.KeyMap(shortcutEl, shortcutCfg);
        }

        if(true === this.autoFocus) {
            this.grid.store.on({scope:this, load:function(){this.field.focus();}});
        }

        if (tb.displayInfo) {
            tb.add('->',tb.displayItem);
        }

        this.toolBar = tb;
    },
            
    /**
     * field el keypup event handler. Triggers the search
     * @private
     */
    onKeyUp:function(e, t, o) {

        // ignore special keys 
        if(e.isNavKeyPress()) { return; }

        var length = this.field.getValue().toString().length;
        if(0 === length || this.minChars <= length) {
            this.onTriggerSearch();
        }
    }, // eo function onKeyUp

    /**
     * Clear Trigger click handler
     * @private 
     */
    onTriggerClear: function() {
        var
            fd  = this.field;
        if (fd){
            if(fd.getValue()) {
                fd.setValue('');
                fd.focus();
                this.onTriggerSearch();
            }
        }
    },
    
    onTriggerSearch: function() {
        if(!this.field.isValid()) {
            return;
        }
        var val = this.field.getValue();
        var store = this.grid.store;

        // grid's store filter  
        if (this.fireEvent('beforesearch', this, store, val) !== false) {
            if(this.mode === 'local') {
                store.clearFilter();
                if(val) {
                    store.filterBy(function(r) {
                        var retval = false;
                        this.menu.items.each(function(item) {
                            if(!item.checked || retval) { return; }
                            var rv = r.get(item.dataIndex);
                            rv = rv instanceof Date ? rv.format(this.dateFormat || r.fields.get(item.dataIndex).dateFormat) : rv;
                            var re = new RegExp(val);
                                re.exec(val);
                            retval = re.test(rv);
                        }, this);
                        if(retval) { return true; }
                        return retval;
                    }, this);
                }
            }
            // ask server to filter records
            else {
                // clear start (necessary if we have paging)
                if(store.lastOptions && store.lastOptions.params) {
                    store.lastOptions.params[store.paramNames.start] = 0;
                }

                // get fields to search array
                var fields = [];
                this.menu.items.each(function(item) {
                    if(item.checked) {
                        if (item.dataIndex) fields.push(item.dataIndex);
                    }
                });

                // add fields and query to baseParams of store
                delete(store.proxy.extraParams[this.paramNames.fields]);
                delete(store.proxy.extraParams[this.paramNames.query]);
                if (store.lastOptions && store.lastOptions.params) {
                    delete(store.lastOptions.params[this.paramNames.fields]);
                    delete(store.lastOptions.params[this.paramNames.query]);
                }
                if(fields.length) {
                    store.proxy.extraParams[this.paramNames.fields] = Ext.encode(fields);
                    store.proxy.extraParams[this.paramNames.query] = val;
                }

                // reload store
                if (this.resetPage === false) store.reload();
                else {
                    store.currentPage = 1;
                    store.reload({
                        page: 1,
                        start: 0
                    });
                }
            }
            
            this.fireEvent('search', this, store, val); 
        }
    },
    
    /**
     * @param {Boolean} true to disable search (TwinTriggerField), false to enable
     */
    setDisabled:function() {
        this.field.setDisabled.apply(this.field, arguments);
    }, // eo function setDisabled

    /**
     * Enable search (TwinTriggerField)
     */
    enable:function() {
        this.setDisabled(false);
    }, // eo function enable

    /**
     * Disable search (TwinTriggerField)
     */
    disable:function() {
        this.setDisabled(true);
    }, // eo function disable

    /**
     * (re)configures the plugin, creates menu items from column model
     * @private 
     */
    reconfigure: function() {
        // remove old items
        var me	 = this,
			menu = me.menu;
        menu.removeAll();

		menu.add(Ext.create('Ext.menu.CheckItem',{
				text			: this.searchLocalText,
				checked			: me.mode === 'local',
				hideOnClick 	: false,
				itemId			: 'ckLocal',
				handler:function(item) {
					var checked = (item.checked) ? true:false;
					me.mode = checked ? 'local' : 'remote';
					item.parentMenu.items.each(function(i) {
						if(i.itemId === 'ckRemote') {
							i.setChecked(!checked);
						}
					});
					me.reconfigureTextField();
				}
			}
		));

		menu.add(Ext.create('Ext.menu.CheckItem',{
				text			: this.searchRemoteText,
				checked			: me.mode === 'remote',
				hideOnClick 	: false,
				itemId			: 'ckRemote',
				handler:function(item) {
					var trigger = {},
						checked = (item.checked) ? true:false;
					me.mode = checked ? 'remote' : 'local';
					item.parentMenu.items.each(function(i) {
						if(i.itemId === 'ckLocal') {
							i.setChecked(!checked);
						}
					});
					me.reconfigureTextField();
				}
			}
		),'-');

        // add Select All item plus separator
        if(this.showSelectAll && this.menuStyle !== 'radio') {
            menu.add(Ext.create('Ext.menu.CheckItem',{
                text:this.selectAllText,
                checked:!(this.checkIndexes instanceof Array),
                hideOnClick:false,
                handler:function(item) {
                    var checked = (item.checked) ? true:false;
                    item.parentMenu.items.each(function(i) {
                        if(item !== i && i.setChecked && !i.disabled && i.itemId !== 'ckRemote' && i.itemId !== 'ckLocal') {
                            i.setChecked(checked);
                        }
                    });
               }
            }),'-');
        }

        // add new items
        var cm = this.grid.columns;
        var group = undefined;
        if(this.menuStyle === 'radio') {
            group = 'g' + (new Date).getTime();	
        }
        Ext.each(cm, function(config) {
            var disable = false;
            if(config.text && config.dataIndex) {
                Ext.each(this.disableIndexes, function(item) {
                    disable = disable ? disable : item === config.dataIndex;
                });
                if(!disable) {
                    menu.add(new Ext.menu.CheckItem({
                        text: config.text,
                        hideOnClick: false,
                        group: group,
                        checked: this.checkIndexes === 'all',
                        dataIndex:config.dataIndex
                    }));
                }
            }
        }, this);

        // check items
        if(this.checkIndexes instanceof Array) {
            Ext.each(this.checkIndexes, function(di) {
                var item = menu.items.findBy(function(itm) {
                    return itm.dataIndex === di;
                });
                if(item) {
                    item.setChecked(true, true);
                }
            }, this);
        }
        
        // disable items
        if(this.readonlyIndexes instanceof Array) {
            Ext.each(this.readonlyIndexes, function(di) {
                var item = menu.items.findBy(function(itm) {
                    return itm.dataIndex === di;
                });
                if(item) {
                    item.disable();
                }
            }, this);
        }
        // }}}
    },

	reconfigureTextField: function () {
		var
			me	= this,
			tb	= me.toolBar,
			fl	= tb.down('customtext');
		me.minChars = me.mode === 'local' ? 1 : 0;
		tb.remove(fl);
		me.field = Ext.create('Admin.field.CustomText',{
			width           : me.width,
			flex            : me.flex,
			allowBlank 	    : true,
			emptyText 	    : me.searchEmptyText,
			selectOnFocus   : (undefined === me.selectOnFocus) ? true : me.selectOnFocus,
			triggers        : {
				trigger1 : {
					cls   : 'x-form-clear-trigger',
					handler : me.createDelegate(me.onTriggerClear, me)
				},
				trigger2 : {
					cls  : (me.minChars) ? 'x-hide-display' : 'x-form-search-trigger',
					handler : me.minChars ? Ext.emptyFn : me.createDelegate(me.onTriggerSearch, me)
				}
			},
			minLength       : me.minLength
		});
		// install event handlers on input field
		me.field.on('render', function() {
			// register quick tip on the way to search
			if((undefined === me.minChars || 1 < me.minChars) && me.minCharsTipText) {
				Ext.tip.QuickTipManager.register({
					target: me.field.el,
					text: me.minChars ? Ext.String.format(me.minCharsTipText, me.minChars) : me.searchTipText
				});
			}

			if(me.minChars) {
				me.field.el.on({scope:me, buffer:300, keyup:me.onKeyUp});
			}

			// install key map
			var map = new Ext.util.KeyMap(this.field.el, [{
				key		: Ext.event.Event.ENTER,
				scope	: me,
				fn		: me.onTriggerSearch
			},{
				key		: Ext.event.Event.ESC,
				scope	: me,
				fn		: me.onTriggerClear
			}]);
			map.stopEvent = true;
		}, me, {single:true});

		tb.add(me.field);
	},

    /**
     * Creates a function delegate, copied from ExtJS 3.4
     * @private
     */
    createDelegate : function(method, obj, args, appendArgs){
        //var method = this;
        return function() {
            var callArgs = args || arguments;
            if (appendArgs === true){
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }else if (Ext.isNumber(appendArgs)){
                callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        }
    }

});
