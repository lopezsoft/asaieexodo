/**
 * Created by LOPEZSOFT on 03/12/2015.
 */
Ext.define('Admin.view.docentes.SugerenciasInsertView',{
    extend : 'Admin.base.WindowCrud',
    alias  	: 'widget.SugerenciasInsertView',
    controller  : 'carga',
    config      : {
        records : null
    },
    store   : 'SugerenciasStore',
    items 	: [
        {
            xtype 		: 'customgrid',
            store		: 'SugerenciasStore',
            plugins		: [
                {
                    ptype: 'rowexpander',
                    rowBodyTpl : new Ext.XTemplate(
                        '<p><b>Descripción:</b> {sugerencia}</p>'
                    )
                },
                {
                    ptype : 'gridfilters'
                }
            ],
            columns: [
                {
                    xtype	: 'rownumberer'
                },
                {
                    text		: "Descripción",
                    flex		: 1,
                    sortable	: true,
                    dataIndex	: 'sugerencia',
                    filter		: 'list'
                },
                {
                    text		: "Tipo",
                    width		: 110,
                    sortable	: true,
                    dataIndex	: 'tipo',
                    filter		: 'list',
                    renderer :  function(val) {
                        switch(val){
                            case '3':
                                return '<span style="color:Darkviolet;">' + 'OBSERVACIÓN' + '</span>';
                            default:
                                return '<span style="color:red;">' + 'SUGERENCIA' + '</span>';
                        }
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
                    xtype 			: 'pagination'
                }
            ]
        }
    ],
    saveData	: function(storeName,reload){
		const me = this.getApp(),
			win = this,
			selectSug = win.down('grid').getSelection(),
			select = win.getRecords(),
			store = Ext.getStore('SugerenciasInsertStore');
		if (selectSug.length > 0) {
            win.mask('Guardando…', 'x-mask-loading');
            Ext.each(select,function (rec) {
                Ext.each(selectSug,function (record) {
                    const data = {
                        id_nota				: rec.get('id'),
                        id_sugerencia	    : record.get('id')
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
