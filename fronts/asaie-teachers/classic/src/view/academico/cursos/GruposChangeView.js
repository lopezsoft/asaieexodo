/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.academico.GruposChangeView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Grupos académicos',
    controller  : 'Academico',
    alias       : 'widget.GruposChangeView',
	requires	: [
		'Admin.combo.CbGrupo'
	],
    height	    : 200,
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbGrupo',
					labelAlign  : 'top'
				}
            ]
        }
    ]
});
