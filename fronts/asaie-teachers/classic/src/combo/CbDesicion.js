Ext.define('Admin.combo.CbDesicion',{
	extend	: 'Admin.combo.ComboExpand',
	requires: [
        'Admin.store.docentes.observador.DesicionStore'
    ],
    initComponent: function(){
        Admin.getApplication().onStore('docentes.observador.DesicionStore');
        this.callParent(arguments);
    },
	alias		: 'widget.CbDesicion',
	fieldLabel	: 'Desición:',
	name		: 'desicion',
    displayField: 'desicion',
    valueField	: 'desicion',
    store		: 'DesicionStore',
    queryMode	: 'local'
});