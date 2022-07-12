Ext.define('Admin.view.representative.Candidacies',{
    extend      : 'Admin.base.WindowCrud',
    title       : 'Ficha de candidaturas',
    controller  : 'representative',
    alias       : 'widget.candidacies',
	modalView	: 'Admin.view.representative.CandidaciesView',
    items       : [
        {
            xtype   : 'customgrid',
            store   : 'CandidaciesStore',
            columns : [
                {
                    xtype   : 'rownumberer'
                },
                {
					text        : 'Nombre de la candidatura',
                    dataIndex   : 'candidacy_name',
                    flex        : 2
                },
                {
                    xtype   	: 'booleancolumn',
                    text    	: 'Activa',
                    trueText	: 'Si',
                    falseText	: 'No',
                    dataIndex	: 'state'
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype   : 'toolbarCrud'
                }
            ]
        }
    ]
});
