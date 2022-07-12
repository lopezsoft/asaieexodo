Ext.define('Admin.combo.CbCandidacies',{
	extend		: 'Admin.combo.CustomComboBox',
	alias		: 'widget.cbcandidacies',
	fieldLabel	: 'Candidatura',
	name		: 'candidacy_id',
    displayField: 'candidacy_name',
    valueField	: 'id',
	reference 	: 'cbcandidacies',
	publishes   : 'value',
	store		: 'CandidaciesStore'
});
