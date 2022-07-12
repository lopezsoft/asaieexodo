/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.academico.GradosChangeView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Grados académicos',
    controller  : 'Academico',
    alias       : 'widget.GradosChangeView',
	requires	: [
		'Admin.combo.CbGrados'
	],
    height	    : 200,
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbGrados',
					name		: 'id_grado',
					valueField	: 'id',
					labelAlign  : 'top'
				}
            ]
        }
    ]
});
