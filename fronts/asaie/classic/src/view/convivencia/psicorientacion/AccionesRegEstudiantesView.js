/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.psicorientacion.AccionesRegEstudiantesView',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.AccionesRegEstudiantesView',
    maximized   : true,
    controller  : 'convivencia',
    itemId      : 'AccionesRegEstudiantesView',
    requires    : [
        'Admin.store.convivencia.AccionesRegEstudiantesStore',
        'Admin.store.convivencia.AccionesStore',
        'Admin.store.general.AdministrativosStore'
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
            store   : 'AccionesRegEstudiantesStore',
            columns : [
                {
                    xtype	    : 'rownumberer'
                },
                {
                    dataIndex   : 'personas_involucradas',
                    text        : 'Personas involucradas',
                    flex        : 1
                },
                {
                    dataIndex   : 'testigos',
                    text        : 'Testigos',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'string'
                },
                {
                    dataIndex   : 'personas_afectadas',
                    text        : 'Personas afectadas',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'compromiso',
                    text        : 'Compromiso',
                    flex        : 1,
                    sortable    : true,
                    filter      : 'list'
                },
                {
                    dataIndex   : 'tratamiento_peg',
                    text        : 'Tratamiento pedagogico',
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
                            handler : 'onCrudAccionesEst'
                        },'-',
                        {
                            xtype	: 'editButton',
                            handler : 'onCrudAccionesEst'
                        },'-',
                        {
                            xtype	: 'deletebutton'
                        },'-',
                        {
                            xtype 	: 'closebutton'
                        },'-','->',
                        {
                            xtype   : 'printButton'
                        },'-',
                        {
                            xtype	: 'facebookButton'
                        },
                        {
                            xtype	: 'youtubeButton'
                        }
                    ]
                }
            ]
        }
    ]
});