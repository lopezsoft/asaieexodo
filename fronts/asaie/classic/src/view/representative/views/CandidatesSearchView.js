Ext.define('Admin.view.representative.CandidatesSearchView',{
    extend      : 'Admin.base.CustomWindow',
    controller  : 'representative',
    title       : 'Estudiantes',
    alias       : 'widget.candidatessearchview',
    items       : [
        {
            xtype   	: 'customgrid',
			selModel	: 'rowmodel',
            store   	: 'CandidatesSearchStore',
            plugins		: [
                // {
                //     ptype: 'rowexpander',
                //     rowBodyTpl : new Ext.XTemplate(
                //         '<p><b>Apellidos y Nombres:</b> {nombres}</p>'
                //     )
                // },
                {
                    ptype : 'gridfilters'
                },
				{
					ptype			: 'gridSearch',
					readonlyIndexes	: ['note'],
					disableIndexes	: ['pctChange'],
					mode            : 'remote',
					flex			: 1,
					autoFocus		: false,
					independent		: true
				}
            ],
            columns : [
                {
                    xtype       : 'rownumberer'
                },
                {
                    text        : 'Apellidos y Nombres',
                    dataIndex   : 'nombres',
                    flex        : 2,
                    filter      : 'string'
                },
                {
                    text        : 'Grado',
                    dataIndex   : 'grado',
                    flex        : 1,
                    filter      : 'list'
                },
                {
                    text        : 'Grupo',
                    dataIndex   : 'id_group',
                    width       : 60,
                    filter      : 'list'
                },
                {
                    text        : 'Sede',
                    dataIndex   : 'sede',
                    flex        : 1,
                    filter      : 'list'
                }
            ],
            dockedItems : [
                {
                   xtype    : 'toolbarCrud',
                    items   : [
                        {
                            xtype   : 'customButton',
                            text    : 'Improtar...',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onImportStudents'
                        }
                    ]
                },
                {
                    xtype   : 'pagination',
                    store   : 'CandidatesSearchStore'
                }
            ]
        }
    ]
});
