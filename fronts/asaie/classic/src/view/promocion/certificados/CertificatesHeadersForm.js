Ext.define('Admin.view.promocion.CertificatesHeadersForm',{
    extend      : 'Admin.forms.CustomForm',
    alias       : 'widget.encabezadocertificado',
    xtype       : 'encabezadocertificado',
    controller  : 'Promocion',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle('Encabezados de certificado final');
    },
    buildWindow: function () {
        this.winObject = Ext.create('Admin.view.promocion.CertificatesHeadersSave');
    },
    showWindow: function (btn) {
		let ts = this,
			data = ts.down('grid').getSelection()[0],
			form = [];
		if (!ts.getWinObject()) {
            ts.buildWindow();
        }
        form = ts.winObject.down('form');
        if (btn.itemId == 'editButton') {
            form.loadRecord(data);
        } else {
            form.reset(true);
        }
        ts.winObject.show();
    },
    showSaveButton: false,
    items   : [{
        xtype       : 'customgrid',
        store       : 'CertificatesHeader',
        plugins		: [
            {
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate(
                    '<p><b>Nombre:</b> {expedition}</p>'
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
        columns     : [
            {
                xtype   : 'customrownumberer'
            },
            {
                text        : 'Vigencia',
                columns     : [
                    {
                        text        : 'desde',
                        dataIndex   : 'year_from',
                        width       : 70
                    },
                    {
                        text        : 'hasta',
                        dataIndex   : 'year_until',
                        width       : 70
                    }
                ]
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Firma rector',
                dataIndex   : 'rector_firm',
                disabled    : true,
                width       : 150
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Firma secretaria',
                dataIndex   : 'signature_secretary',
                disabled    : true,
                width       : 150
            },
            {
                xtype       : 'checkcolumn',
                text        : 'Mostar número',
                dataIndex   : 'show_number',
                disabled    : true,
                width       : 150
            }
        ],
        dockedItems : [
            {
                xtype   : 'toolbarCrud'
            },
            {
                xtype 		: 'pagination',
                itemId		: 'pToolbar'
            }
        ]
    }]
});
