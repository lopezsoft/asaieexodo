/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.academico.ConfirmarViejosView',{
    extend  : 'Admin.base.WindowCrud',
    title   : 'Confirmar matricula',
    controller  : 'Academico',
    alias       : 'widget.ConfirmarViejosView',
	requires	: [
		'Admin.combo.CbGrados',
		'Admin.combo.CbGrupo',
		'Admin.combo.CbSedes',
		'Admin.combo.CbJornadas',
		'Admin.store.general.MatricularAntiguosStore'
	],
    height	    : 400,
	width		: 450,
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'CbSedes',
					labelAlign  : 'top'
				},
				{
					xtype		: 'CbGrados',
					labelAlign  : 'top'
				},
				{
					xtype		: 'CbGrupo',
					labelAlign  : 'top'
				},
				{
					xtype		: 'CbJornadas',
					labelAlign  : 'top',
					name		: 'id_jorn'
				}
            ]
        }
    ]
});
