Ext.define('Admin.combo.ComboExpand',{
	extend 	: 'Admin.combo.CustomComboBox',
	alias	: 'widget.ComboExpand',
	queryMode 	: 'local',
	listeners   : {
		focusenter	: function( cb, event, eOpts ){
				this.expand();		
		}
	}	
});