/**
 * Created by LOPEZSOFT on 2/01/2016.
 */
Ext.define('Admin.view.docentes.ImportarDescriptores', {
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.importardescriptores',
    xtype   : 'importardescriptores',
    config : {
        record : null
    },
    controller :  'logros',
    items   : [
        {
            xtype   : 'customgrid',
            store   : 'ImportarDescriptoresStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>',
                        '<p><b>Competencia:</b> {competencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: true,
                    independent		: true
                }
            ],
            columns :  [
                {
                    xtype       : 'rownumberer'
                },
                {
                    text        : 'Descripción',
                    dataIndex   : 'descripcion',
                    flex        : 2
                },
                {
                    text        : 'Competencia',
                    dataIndex   : 'competencia',
                    flex        : 1,
                    filters     : 'list'
                },
                {
                    text        : 'Periodo',
                    dataIndex   : 'periodo',
                    filters     : 'list'
                },
                {
                    text		: "Desempeño",
                    width		: 102,
                    dataIndex	: 'nombre_escala',
                    filter		: 'list',
                    renderer 	:  function(val) {
                        return '<span style="color:#7e55ef;"> <b>' + val + '</b></span>';
                    }
                }
            ],
			features: [
				{
					ftype	: 'grouping',
					startCollapsed: true,
					groupHeaderTpl: '<span style="color:#7e55ef;"> <b>' + '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})' + '</b></span>'
				}
			],
            dockedItems: [
                {
                    xtype   : 'customToolbar',
                    items : [
                        {
                            xtype   : 'customButton',
                            text    : 'importar',
                            itemId  : 'btnImport',
                            iconCls : 'x-fa fa-upload',
                            handler : 'onClickImportYear'
                        },'-','->',
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                },
                {
                    xtype   : 'pagination'
                }
            ]
        }
    ]
});
