Ext.define('Admin.view.representative.CandidatesView',{
    extend  	: 'Admin.base.SaveWindow',
    alias   	: 'widget.candidatesview',
    controller  : 'representative',
    title       : 'Candidatos',
    maxHeight   : 380,
	store   	: 'CandidatesStore',
	defaultFocus	: 'cbenrolledstudents',
    items       : [
        {
            xtype   		: 'customform',
			defaultFocus	: 'cbenrolledstudents',
            items   : [
                {
                    xtype       : 'cbenrolledstudents',
					fieldLabel	: 'Candidato',
					labelAlign	: 'top',
                    name        : 'enrollment_id',
                },
                {
                    xtype       : 'customtext',
					labelAlign	: 'left',
					fieldLabel  : 'Número',
					labelWidth	: 100,
                    name        : 'number'
                },
                {
                    xtype       : 'cbcandidacies',
					labelWidth	: 100,
                },
				{
					xtype       : 'radiogroup',
					fieldLabel  : 'Estado de disponibilidad',
					labelStyle  : 'font-weight:bold',
					labelWidth  : 180,
					defaults    : {
						name    : 'availability_status'
					},
					items       : [
						{
							boxLabel    : 'Mostrar en todos los grados y mesas',
							title     	: 'El candidato  estará disponible en todos los grados y mesas',
							inputValue  : '1',
						},
						{
							boxLabel    : 'Mostrar solo en el grado y/o mesa de matricula',
							title     : 'El candidato solo estará disponible en el grado donde está matriculado, o en el grado y mesa de su matricula',
							inputValue  : '2'
						}
					]
				},
				{
					xtype: 'yearField',
					readOnly: true,
				}
            ]
        }
    ],
	afterSave	: function() {
		const store	= Ext.getStore('CandidatesStore');
		store.reload();
	}
});
