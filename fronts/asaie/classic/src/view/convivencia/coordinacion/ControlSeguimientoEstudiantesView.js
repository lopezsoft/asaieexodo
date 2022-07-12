/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.coordinacion.ControlSeguimientoEstudiantesView',{
    extend      : 'Admin.base.WindowCrud',
    alias       : 'widget.ControlSeguimientoEstudiantesView',
    maximized   : true,
    controller  : 'convivencia',
    itemId      : 'ControlSeguimientoEstudiantesView',
    requires    : [
        'Admin.store.convivencia.ControlSeguimientoEstudiantesStore'
    ],
    items : [
        {
            xtype   : 'customgrid',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Compromiso del estudiante:</b> {compromiso_estudiante}</p>'+
                        '<p><b>Compromiso del familiar/acudiente:</b> {compromiso_acudiente}</p>'+
                        '<p><b>Compromiso del docente:</b> {compromiso_docente}</p>'
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
            store   : 'ControlSeguimientoEstudiantesStore',
            columns : [
                {
                    xtype	    : 'rownumberer'
                },
                {
                    dataIndex   : 'compromiso_estudiante',
                    text        : 'Compromiso del estudiante',
                    flex        : 1
                },
                {
                    dataIndex   : 'compromiso_acudiente',
                    text        : 'Compromiso del familiar/acudiente',
                    flex        : 1,
                    sortable    : true
                },
                {
                    dataIndex   : 'compromiso_docente',
                    text        : 'Compromiso del docente',
                    flex        : 1,
                    sortable    : true
                },
                {
                    dataIndex   : 'fecha_acta',
                    text        : 'Fecha del acta'
                },
                {
                    dataIndex   : 'hora_acta',
                    text        : 'Hora del acta'
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
                            handler : 'onCruControl'
                        },'-',
                        {
                            xtype	: 'editButton',
                            handler : 'onCruControl'
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