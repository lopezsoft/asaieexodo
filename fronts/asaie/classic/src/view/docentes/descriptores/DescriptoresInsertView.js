Ext.define('Admin.view.docentes.DescriptoresInsertView',{
    extend : 'Admin.base.WindowCrud',
    alias  	: 'widget.descriptoresinsert',
    xtype  	: 'widget.descriptoresinsert',
    controller 	: 'carga',
    store       : 'LogrosStore',
    config      : {
        records : null
    },
    items 	: [
        {
            xtype 		: 'customgrid',
            store		: 'LogrosStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {descripcion}</p>',
                        '<p><b>Periodo:</b> {periodo}</p>',
                        '<p><b>Competencia:</b> {competencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            selType : 'checkboxmodel',
			features: [
				{
					ftype	: 'grouping',
					startCollapsed: true,
					groupHeaderTpl: '<span style="color:#7e55ef;"> <b>' + '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})' + '</b></span>'
				}
			],
            columns: [
                {
                  xtype     : 'rownumberer'
                },
                {
                    text		: "Descripción",
                    flex		: 2,
                    sortable	: true,
                    dataIndex	: 'descripcion',
                    filter		: 'string'
                },
                {
                    text        : 'Competencia',
					menuDisabled: true,
                    flex		: 1,
                    sortable	: true,
                    dataIndex	: 'competencia',
                    filter		: 'list'
                },
                {

                    text		: "Periodo",
                    width		: 75,
                    sortable	: true,
                    dataIndex	: 'periodo'
                },
                {
                    text		: "Desempeño",
                    width		: 100,
                    dataIndex	: 'nombre_escala',
                    filter      : 'list',
                    renderer :  function(val) {
                        return '<span style="color:Darkviolet;"> <b>' +val+ '</b></span>';
                    }
                },
                {
                    text		: "Año",
                    width		: 60,
                    dataIndex	: 'year'
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbarSave'
                },
                {
                    xtype 			: 'pagination',
                    store			: 'LogrosStore'
                }
            ]
        }
    ],
    saveData	: function(storeName,reload){
		var me 		        = this.getApp(),
			win		        = this,
            selectLogros    = win.down('grid').getSelection(),
            select          = win.getRecords(),
            store           = Ext.getStore('LogrosEstandarStore');

        if (selectLogros.length > 0) {
            win.mask('Guardando…', 'x-mask-loading');
            Ext.each(select,function (rec) {
                Ext.each(selectLogros,function (record) {
                    data = {
                        id_nota				: rec.get('id'),
                        id_logro_estandar	: record.get('id'),
                        final				: rec.get('final'),
                        id_escala			: record.get('id_escala'),
                        estado				: record.get('estado')
                    };
                    store.insert(0, data);
                });
            });
            store.sync({
                success: function () {
                    win.unmask();
                    win.close();
                    me.showResult('Se guardaron los datos correctamente')
                },
                failure: function () {
                    win.unmask();
                    me.showResult('No se guardaron los datos correctamente')
                }
            });
        } else {
            me.onAler('No hay datos seleccionado para guardar...');
        }
	}
});
