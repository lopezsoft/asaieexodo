/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.AspectosObservadorView',{
    extend  : 'Admin.base.WindowCrud',
    controller  : 'configuraciones',
    alias       : 'widget.AspectosObservadorView',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Aspectos del observador - '+ Global.getYear());
    },config    : {
        record  : null
    },
    store       : 'AspectosObservadorStore',
    showWindow  : function(btn){
        win     = Ext.create('Admin.view.configuraciones.AspectosObservadorSaveView');
        form    = win.down('form');
        form.reset(true);
        if(btn.itemId == 'editButton'){
            record  = btn.up('window').down('grid').getSelection()[0];
            form.loadRecord(record);
        }
        win.down('#id_modelo').setValue(this.getRecord().get('id'));
        win.show();
    },
    items       : [
        {
            xtype       : 'customgrid',
            store       : 'AspectosObservadorStore',
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
                    autoFocus		: true,
                    independent		: true
                }
            ],
            iconCls     : '',
            columns : [
                {
                    xtype   : 'customrownumberer'
                },
                {
                    dataIndex   : 'descripcion',
                    text        : 'Descripción',
                    flex        : 2
                },
                {
                    xtype       : 'checkcolumn',
                    disabled    : true,
                    dataIndex   : 'convivencia',
                    text        : 'Convivencia',
                    width       : 100
                },
                {
                    xtype       : 'checkcolumn',
                    disabled    : true,
                    dataIndex   : 'estado',
                    text        : 'Activo',
                    width       : 70
                },
                {
                    dataIndex   : 'year',
                    text        : 'Año',
                    width       : 55
                }
            ],
            dockedItems : [
                {
                    xtype   : 'pagination'
                },
                {
                    xtype       : 'toolbarCrud',
                    items 	: [
                        {
                            xtype	: 'addButton'
                        },'-',
                        {
                            xtype	: 'editButton'
                        },'-',
                        {
                            xtype	: 'deletebutton'
                        },'-',
                        {
                            xtype 	: 'closebutton'
                        },'-','->',
                        {
                            xtype	: 'customButton',
                            iconCls : 'x-fa fa-spinner',
                            text    : 'Criterios',
                            tooltip : 'Criterios de observación',
                            handler : 'onCriterios',
                            disabled    : true,
                            itemId      : 'btnCriterios'
                        },
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