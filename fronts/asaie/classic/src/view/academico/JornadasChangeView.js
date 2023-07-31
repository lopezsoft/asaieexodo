/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.academico.JornadasChangeView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Jornadas académicas',
	controller  : 'academico',
    alias       : 'widget.JornadasChangeView',
	requires	: [
		'Admin.combo.CbJornadas'
	],
    height	    : 200,
	width		: 400,
	maximizable : false,
	store		: 'JornadasStore',
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbJornadas',
					labelAlign  : 'top'
				}
            ]
        }
    ],
	saveData	: function(storeName,reload){
		let me		= this,
			record	= me.getRecord(),
			rec		= me.down('#comboJornadas').getSelection();
		let subject = {
			id_jorn: rec.id,
			jornada: rec.get('jornada')
		}
		record.set(subject);
		me.close();
	},
	syncSize	: function(){
		// this.callParent(arguments);
	}
});
