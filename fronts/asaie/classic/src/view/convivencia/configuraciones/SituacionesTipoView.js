/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.configuraciones.SituacionesTipoView',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.SituacionTipoView',
    requires    : [
        'Admin.store.convivencia.SituacionesTipoStore'
    ],
    controller  : 'convivencia',
    items : [
        {
            xtype   : 'customgrid',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>'
                    )
                },
                {
                    ptype			: 'gridSearch',
                    readonlyIndexes	: ['note'],
                    disableIndexes	: ['pctChange'],
                    minChars		: 1,
                    mode            : 'local',
                    flex			: 1,
                    autoFocus		: false,
                    independent		: true
                }
            ],
            iconCls : '',
            store   : 'SituacionesTipoStore',
            columns : [
                {
                    xtype	    : 'rownumberer'
                },
                {
                    dataIndex   : 'descripcion',
                    text        : 'Descripción',
                    flex        : 2,
                    sortable    : true
                },
                {
                    xtype       : 'booleancolumn',
                    dataIndex   : 'estado',
                    text        : 'Activa',
                    trueText    : 'Si',
                    falseText   : 'No',
                    width       : 70
                }
            ],
            dockedItems: [
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar'
                },
                {
                    xtype       : 'toolbarCrud'
                }
            ]
        }
    ]
});