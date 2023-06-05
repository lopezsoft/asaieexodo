Ext.define('Admin.grid.CustomGrid' ,{
    extend	: 'Ext.grid.Panel',
    alias 	: 'widget.customgrid',
    xtype 	: 'customgrid',
	ui      : 'panel-white',
    requires: [
        'Ext.grid.filters.Filters',
		'Admin.button.ButtonsCrud',
		'Admin.button.LargeButton',
		'Admin.button.PrintButton',
		'Admin.toolbar.CustomToolbar',
		'Admin.container.CustomContainer',
		'Admin.toolbar.ToolbarCrud',
		'Admin.toolbar.ToolbarSave',
		'Admin.toolbar.Pagination',
		'Admin.field.CustomDate',
		'Admin.field.NumberField',
		'Admin.field.HtmlEditor',
		'Admin.tab.CustomTab',
		'Admin.field.CustomText',
		'Admin.field.TimeField',
		'Admin.button.ContainerButton',
		'Admin.button.ButtonPanel',
		'Ext.form.field.Radio',
		'Ext.grid.selection.SpreadsheetModel',
		'Ext.grid.plugin.Clipboard',
		'Ext.grid.selection.Replicator',
        'Ext.XTemplate',
        'Ext.util.KeyNav',
        'Ext.fx.*',
        'Ext.util.Memento',
        'Ext.ux.exporter.Exporter',
		'Ext.ux.PreviewPlugin',
		'Admin.container.ResponsiveContainer',
		'Admin.container.DataListContainer',
		'Admin.field.FieldSet',
		'Admin.field.FieldContainer',
		'Admin.field.YearField',
		'Admin.grid.Search',
		'Admin.grid.CustomRowNumberer',
		'Admin.grid.CheckboxModel'
	],
	initComponent: function(){
		let	me	= this,
			form= me.up('form'),
			win = me.up('window');
		if(form && me.getSyncHeight() && !win){
			form.setLayout('fit');
		}
		me.callParent(arguments);
	},
	viewConfig: {
		enableTextSelection	: true,
		markDirty			: true
	},
	config				: {
		syncHeight			: true
	},
	editData			: false, // Propiedad que identifica si se está en edición.
    loadmask 			: true,
    autoLoad			: true,
	selModel			: 'CheckboxModel',
    columnLines			: true,
	reserveScrollbar	: true,
	frame   			: false,
	minHeight			: 300,
	scrollable			: true,
	allowDeselect 		: true,
	stripeRows      	: true,
	cls					: 'email-inbox-panel shadow',
	plugins		: [
	    {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<p><b>Descripción:</b> {descripcion}</p>'
           	)
		},
		{
		 	ptype : 'gridfilters'
		},
		{
			ptype : 'responsive'
		},
		{
			ptype			: 'gridSearch',
			readonlyIndexes	: ['note'],
			disableIndexes	: ['pctChange'],
			mode            : 'remote',
			flex			: 1,
			autoFocus		: false,
			independent		: true
		}
    ],
	defaults	: {
		menuDisabled	: true
	},
    listeners: {

		beforedestroy : function (grid) {
			var
				pg	= grid.getPlugin('gridSearch');
			if(!Ext.isEmpty(pg)){
				pg.onTriggerClear();
			}
		},
	    'render': function(grid, eOpts) {
			var me	= this;

			if (me.down('#pToolbar')) {
                me.down('#pToolbar').setStore(grid.getStore());
            }
		},
		'selectionchange': function(grid, selected, eOpts) {
			var me	= this;

			if (me.down('#btnCloseVoting')){
				me.down('#btnCloseVoting').setDisabled(!selected.length);
			}

			if (me.down('#btnOpenVoting')){
				me.down('#btnOpenVoting').setDisabled(!selected.length);
			}
			
			if (me.down('#btnGrades')){
				me.down('#btnGrades').setDisabled(!selected.length);
			}

			if (me.down('#dtnHeadquarter')){
				me.down('#dtnHeadquarter').setDisabled(!selected.length);
			}

			if (me.down('#btnJury')){
				me.down('#btnJury').setDisabled(!selected.length);
			}
			
			if (me.down('#printbutton2')){
				me.down('#printbutton2').setDisabled(!selected.length);
			}
			
			if (me.down('#buttonstarting')){
				me.down('#buttonstarting').setDisabled(!selected.length);
			}

			if (me.down('#noveltyButton')){
				me.down('#noveltyButton').setDisabled(!selected.length);
			}
			
			if (me.down('#extrabutton')){
				me.down('#extrabutton').setDisabled(!selected.length);
			}

			if (me.down('#btnViewQuestion')){
				me.down('#btnViewQuestion').setDisabled(!selected.length);
			}

			if (me.down('#btnAddQuestion')){
				me.down('#btnAddQuestion').setDisabled(!selected.length);
			}

			if (me.down('#btnCriterios')){
				me.down('#btnCriterios').setDisabled(!selected.length);
			}

			if (me.down('#btnNewMat')){
				me.down('#btnNewMat').setDisabled(!selected.length);
			}

			if (me.down('#btnMatricula')){
				me.down('#btnMatricula').setDisabled(!selected.length);
			}

			if (me.down('#btnDeleteForce')){
				me.down('#btnDeleteForce').setDisabled(!selected.length);
			}

			if (me.down('#btnFamil')){
				me.down('#btnFamil').setDisabled(!selected.length);
			}

			if (me.down('#btnWebcam')){
				me.down('#btnWebcam').setDisabled(!selected.length);
			}

			if (me.down('#btnJornSede')){
				me.down('#btnJornSede').setDisabled(!selected.length);
			}

			if (me.down('#btnNivSede')){
				me.down('#btnNivSede').setDisabled(!selected.length);
			}
			if (me.down('#btnDocDig')){
				me.down('#btnDocDig').setDisabled(!selected.length);
			}

			if (me.down('#saveButton')){
				me.down('#saveButton').setDisabled(!selected.length);
			}

			if (me.down('#editButton')){
				me.down('#editButton').setDisabled(!selected.length);
			}

			if (me.down('#deletebutton')){
				me.down('#deletebutton').setDisabled(!selected.length);
			}

			if (me.down('#printButton')){
				me.down('#printButton').setDisabled(!selected.length);
			}

			if (me.down('#customButton')) {
				me.down('#customButton').setDisabled(!selected.length);
			}

			if (me.down('#custombutton')) {
				me.down('#custombutton').setDisabled(!selected.length);
			}

		}
	},
	dockedItems: [
		{
	        xtype 		: 'pagination',
	        itemId		: 'pToolbar',
	        items 		: [
				{
					xtype		: 'exportButton'
				}
	        ]	
		}
	],

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
		let me  	= this,
			form	= me.up('form'),
			win		= me.up('window'),
			height = Ext.Element.getViewportHeight();
		if(form || win) {
			// height	= form.getHeight();
			// console.log(height);
			// this.setMaxHeight(height - 148);
		}else{
			this.setMaxHeight(height - 148);
		}
    }
});
