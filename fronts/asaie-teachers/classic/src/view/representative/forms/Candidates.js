Ext.define('Admin.view.representative.Candidates',{
    extend  	: 'Admin.base.CustomWindow',
    title   	: 'Candidatos',
    controller  : 'representative',
    alias       : 'widget.candidates',
	modalView	: 'Admin.view.representative.CandidatesView',
    items       : [
        {
            xtype   	: 'customgrid',
			selModel	: 'rowmodel',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    selectRowOnExpand : true,
                    rowBodyTpl : new Ext.XTemplate(
                        '<div class="thumb-wrap">',
                            '<div class="thumb">',
                                '<img alt="{names}" src="{image}"/>',
                            '</div>',
                            '<span>{names}</span>',
                        '</div>'
                    )
                },
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
                    text        : 'Curso',
                    defaults    : {
                        width   : 65
                    },
                    columns     : [
                        {
							text        : 'Grado',
                            dataIndex   : 'grade',
                            filter      : 'list',
                            width       : 120
                        },
                        {
                            text        : 'Grupo',
                            dataIndex   : 'group_name',
                            filter      : 'list'
                        }
                    ]
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
                    xtype   :'actioncolumn',
                    width   :50,
                    items   : [
                        {
                            iconCls: 'x-fa fa-upload',
                            tooltip: 'Editar foto',
                            handler: function(grid, rowIndex, colIndex) {
                                var rec = grid.getStore().getAt(rowIndex),
                                    me  = Admin.getApplication();

                                if (rec.get('type') == 1){
                                    extra   = {
                                        pdbTable    : 'tp_voto_blanco',
                                        pdbType     : 1,
                                        pdbId       : rec.get('id')
                                    };
                                }else {
                                    extra   = {
                                        pdbTable    : 'tp_candidates',
                                        pdbType     : 2,
                                        pdbId       : rec.get('id')
                                    };
                                }

                                Ext.create('Admin.base.UploadPhoto',{
									title		: 'Subir foto',
									urlPhoto 	: me.getUrlBase()+'representative/uploadCandidatePhoto',
									extParam	: extra,
									store       : 'CandidatesStore',
								}).show();
                            }
                        }
                    ]
                },
                {
					text        : 'Número',
                    dataIndex   : 'number',
                    width       : 90
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
