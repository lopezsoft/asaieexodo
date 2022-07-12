Ext.define('Admin.combo.CbFamilies',{
	extend	: 'Admin.combo.CustomComboBox',
	requires: [
        'Admin.store.inscripciones.FamiliesStore'
    ],
	alias		: 'widget.cbfamilies',
	fieldLabel	: 'Familiar',
	name		: 'id_family',
    displayField: 'name_kinship',
    valueField	: 'id',
    store		: 'FamiliesStore',
    tpl: Ext.create('Ext.XTemplate',
        '<ul class="x-list-plain"><tpl for=".">',
            '<li role="option" class="x-boundlist-item">{document} - {name1} {name2} {lastname1} {lastname2}</li>',
        '</tpl></ul>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{document} - {name1} {name2} {lastname1} {lastname2}',
        '</tpl>'
    )
});