Ext.define('Admin.view.representative.CandidaciesView',{
    extend  	: 'Admin.base.SaveWindow',
    title   	: 'Candidaturas',
    controller  : 'representative',
    alias   	: 'widget.candidaciesview',
	store   	: 'CandidaciesStore',
    maxHeight  	: 270,
    items   : [
        {
            xtype   	: 'customform',
            items   : [
                {
					fieldLabel  : 'Nombre de la candidatura',
                    name        : 'candidacy_name',
                },
                {
                    xtype		: 'customradiogroup',
                    columns		: 1,
                    vertical	: true,
                    fieldLabel	: 'Estado',
                    items		: [
                        {
                            boxLabel	: 'Activo',
                            name		: 'state',
                            inputValue	: 1,
                            checked		: true
                        },
                        {
                            boxLabel	: 'Inactivo',
                            name		: 'state',
                            inputValue	: 0
                        }
                    ]
                }
            ]
        }
    ]
});
