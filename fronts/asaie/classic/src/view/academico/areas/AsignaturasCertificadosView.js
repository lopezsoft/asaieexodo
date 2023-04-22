/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.view.academico.AsignaturasCertificadosView',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.AsignaturasCertificadosView',
    requires: [
        'Admin.store.general.AsignaturaCertificadoStore'
    ],
    controller : 'academico',
    width   : 800,
    height  : 400,
    maximized: false,
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewSubjects());
    },
    buildWindow: function () {
        var
            me = this.getApp();
        this.winObject = Ext.create('Admin.view.academico.AsignaturasCertificadosFormView');
    },
    showWindow: function (btn) {
        var me = this.app,
            ts = this,
            data = ts.down('grid').getSelection()[0],
            form = [];
        Ext.require([
            'Admin.view.academico.AsignaturasCertificadosFormView'
        ]);

        Ext.onReady(function () {
            if (!ts.getWinObject()) {
                ts.buildWindow();
            }
            form = ts.winObject.down('form');
            if (btn.itemId == 'editButton') {
                form.loadRecord(data);
            } else {
                form.reset(true);
            }
			ts.winObject.setRecord(ts.getRecord());
            ts.winObject.show();
        });
    },
    store: 'AsignaturaCertificadoStore',
    items   : [{
        xtype       : 'customgrid',
        plugins		: [
            {
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate(
                    '<p><b>Nombre:</b> {nombre}</p>'
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
        iconCls     : '',
        store       : 'AsignaturaCertificadoStore',
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Nombre de la asignatura',
                dataIndex   : 'nombre',
                width       : 300
            },
            {
                text        : 'Abreviatura',
                dataIndex   : 'abrev',
                width       : 100
            },
            {
                text        : 'I/H',
                dataIndex   : 'ih',
                width       : 50
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Estado (Activo)',
                dataIndex   : 'estado',
                width       : 120,
                disabled    : true
            }
        ],
        dockedItems : [
            {
                xtype   : 'toolbarCrud',
                items   : [
                    {
                        xtype   : 'addButton'
                    },'-',
                    {
                        xtype   : 'editButton'
                    },'-',
                    {
                        xtype   : 'deletebutton'
                    },'-',
                    {
                        xtype   : 'closebutton'
                    }
                ]
            },
            {
                xtype 		: 'pagination',
                itemId		: 'pToolbar'
            }
        ]
    }]
});
