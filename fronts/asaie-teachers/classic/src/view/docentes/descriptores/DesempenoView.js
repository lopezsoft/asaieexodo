Ext.define('Admin.view.docentes.DesempenoView',{
    extend      : 'Admin.base.WindowCrud',
    alias  	    : 'widget.desempenoview',
    controller 	: 'carga',
    maxWidth	: 650,
    store       : 'EscalaNacionalStore',
    maxHeight	: 450,
    items 	: [
        {
            xtype 		: 'customgrid',
            store		: 'EscalaNacionalStore',
            columns: [
                {
                    xtype: 'rownumberer'
                },
                {
                    text		: "Desempeño",
                    flex		: 2,
                    sortable	: true,
                    dataIndex	: 'nombre_escala',
                    filter		: 'list'
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
    onSave  : function(btn){
        let
            me 	    = btn.up('window'),
            selectS = me.down('grid').getSelection()[0],
            winNota = Ext.ComponentQuery.query('notasacademicasdocentes')[0],
            select  = me.getRecords(),
            btn1	= winNota.down('#btnSave'),
            btn2	= winNota.down('#btnUndo');
        Ext.each(select,function (rec) {
			rec.set('id_escala',selectS.get('id'));
			rec.set('nombre_escala',selectS.get('nombre_escala'));
		});
        if (btn1.isDisabled()) {
            btn1.setDisabled(false);
        }

        if (btn2.isDisabled()) {
            btn2.setDisabled(false);
        }
        me.close();
    }
});
