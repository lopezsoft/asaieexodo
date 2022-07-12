Ext.define('Admin.view.representative.WhiteVote',{
    extend  	: 'Admin.base.CustomWindow',
    title   	: 'Candidatos',
    controller  : 'representative',
    alias       : 'widget.whitevote',
	modalView	: 'Admin.view.representative.WhiteVoteView',
    items       : [
        {
            xtype   	: 'customgrid',
			selModel	: 'rowmodel',
            plugins		: [
                {
                    ptype : 'gridfilters'
                }
            ],
            store   : 'CandidatesStore',
            columns : [
                {
                    xtype   : 'rownumberer'
                },
                {
                    text        : 'Candidatos',
                    dataIndex   : 'names',
                    flex        : 2,
                    filter      : 'string'
                },
                {
					text        : 'Foto',
                    dataIndex   : 'image',
                    width       : 142,
                    renderer    : function (val) {
                        return '<img alt="{names}" height="128" width="128" src="'+val+'"/>';
                    }
                },
                {
					text        : 'Candidatura',
                    dataIndex   : 'candidacy_name',
                    width       : 120
                },
                {
					text        : 'Año',
                    dataIndex   : 'year',
                    width       : 60
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination',
                    store   : 'CandidatesStore'
                },
                {
                    xtype   : 'toolbarCrud'
                }
            ]
        }
    ]
});
