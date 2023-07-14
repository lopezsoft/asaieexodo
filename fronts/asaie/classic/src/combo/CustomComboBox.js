Ext.define('Admin.combo.CustomComboBox',{
	extend	    : 'Ext.form.field.ComboBox',
	alias	    : 'widget.customComboBox',
	xtype	    : 'customcombobox',
	queryMode	: 'remote',
	allowBlank	: false,
	labelAlign	: 'left',
    labelStyle	: 'font-weight:bold',
    queryCaching: true,
    typeAhead   : true,
    selectOnFocus   : true,
    focusable		: true,
    width 		: '100%',
    emptyText 	: 'Seleccione por favor...',
    queryDelay	: '10',
    labelWidth	: 180,
    autoLoadOnValue : true,
    minChars    : 3,
    anyMatch    : true,
    modal       : true,
    frame       : true,
    pageSize    : 30,
    enableRegEx : true,
    listeners: {
        beforequery: function(qe){
            delete qe.combo.astQuery;
        },
        focusenter : function (t) {
			let oldValue = t.value;
            if (oldValue) {
                t.expand();
            }

        }
    }
});

