/**
 * Created by LOPEZSOFT on 21/01/2016.
 */
Ext.define('Admin.view.academico.forms.NivelacionesListFormView',{
    extend	: 'Admin.base.WindowCrud',
    maxWidth	: 600,
    maxHeight	: 200,
    minHeight   : 100,
    itemId      : 'NivelacionesListFormView',
    alias 	    : 'widget.NivelacionesListFormView',
    controller  : 'academico',
    requires    : [
        'Admin.button.PrintButton'
    ],
    items : [
        {
            xtype   : 'toolbarCrud',
            items   : [
                {
                    xtype 		: '.ComboPeriodos',
                    labelAlign	: 'left'
                },
                {
                    xtype       : '.ComboNivelAcademico',
                    name        : 'nivel',
                    labelAlign	: 'left',
                    width 		: 350,
                    labelWidth	: 120
                },
                {
                    xtype       : 'printButton',
                    bind        : {
                        disabled    : '{!periodo.value}'
                    }
                }
            ]
        }
    ]
});
