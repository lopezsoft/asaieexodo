/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.academico.JornadasChangeView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Jornadas académicas',
    controller  : 'Academico',
    alias       : 'widget.JornadasChangeView',
	requires	: [
		'Admin.combo.CbJornadas'
	],
    height	    : 200,
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
    ]
});
