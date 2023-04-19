Ext.define('Admin.view.representative.CandidatesView',{
    extend  	: 'Admin.base.SaveWindow',
    alias   	: 'widget.candidatesview',
    controller  : 'representative',
    title       : 'Candidatos',
    maxHeight   : 280,
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
					xtype: 'numberfield',
					fieldLabel: 'Year',
					name: 'year',
					minValue: 2014, 
					maxValue: new Date().getFullYear() ,
					hideTrigger: true,
					allowBlank: false
				} 
            ]
        }
    ],
	afterSave	: function() {
		const store	= Ext.getStore('CandidatesStore');
		store.reload();
	}
});
