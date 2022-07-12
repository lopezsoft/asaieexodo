
Ext.define('Admin.combo.CbEnrolledStudents',{
	extend		: 'Admin.combo.CustomComboBox',
	alias		: 'widget.cbenrolledstudents',
	name		: 'student_id',
    displayField: 'nombres',
    emptyText 	: 'Seleccione un estudiante por favor...',
    valueField	: 'id',
    publishes   : 'value',
    store		: 'CandidatesSearchStore',
    tpl: Ext.create('Ext.XTemplate',
        '<ul class="x-list-plain"><tpl for=".">',
            '<li role="option" class="x-boundlist-item"> {nombres} - {grado} - {id_group} - {sede}</li>',
        '</tpl></ul>'
    ),
    // template for the content inside text field
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{nombres} - {grado} - {id_group}',
        '</tpl>'
    )
});
