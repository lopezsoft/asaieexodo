/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.coordinacion.SituacionesRegEstuduantesView',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.SituacionesRegEstuduantesView',
    itemId      : 'SituacionesRegEstuduantesView',
    maximized   : true,
    controler   : 'convivencia',
    requires    : [
        'Admin.store.convivencia.SituacionesRegEstudiantesStore',
        'Admin.store.convivencia.SituacionesStore'
    ],
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
            store   : 'SituacionesRegEstudiantesStore',
            columns : [
                {
                    xtype	    : 'rownumberer'
                },
                {
                    dataIndex   : 'numero',
                    text        : 'Número',
                    width       : 80
                },
                {
                    dataIndex   : 'descripcion',
                    text        : 'Descripción',
                    flex        : 2,
                    sortable    : true,
                    filter      : 'string'
                },
                {
                    dataIndex   : 'observacion',
                    text        : 'Observación',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'tipo',
                    text        : 'Tipo',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'directivo',
                    text        : 'Directivo',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'docente',
                    text        : 'Docente',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'año',
                    text        : 'Año',
                    width       :  60
                }
            ],
            listeners: {
                'selectionchange': function(grid, selected, eOpts) {
                    this.down('#btnAccion').setDisabled(!selected.length);
                    this.down('#btnControl').setDisabled(!selected.length);
                }
            },
            dockedItems: [
                {
                    xtype 		: 'pagination',
                    itemId		: 'pToolbar'
                },
                {
                    xtype       : 'toolbarCrud',
                    items 	: [
                        {
                            xtype	: 'addButton',
                            handler : 'onCrudSituacionesEst'
                        },'-',
                        {
                            xtype	: 'editButton',
                            handler : 'onCrudSituacionesEst'
                        },'-',
                        {
                            xtype	: 'deletebutton'
                        },'-',
                        {
                            xtype 	: 'closebutton'
                        },'-','->',
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        }
                    ]
                },
                {
                    xtype       : 'customToolbar',
                    itemId      : 'toolAcciones',
                    //hidden      : true,
                    defaultType : 'customButton',
                    defaults : {
                        disabled: true
                    },
                    items   : [
                        {
                            text    : 'Aplicar acción',
                            itemId  : 'btnAccion',
                            iconCls : 'x-fa fa-share-square-o',
                            handler : 'onAcciones'
                        },
                        {
                            text    : 'Control y seguimiento',
                            itemId  : 'btnControl',
                            iconCls : 'x-fa fa-share-square-o',
                            handler : 'onControl'
                        }
                    ]
                }
            ]
        }
    ]
});