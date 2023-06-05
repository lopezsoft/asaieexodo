/**
 * Created by LOPEZSOFT on 6/01/2016.
 */
Ext.define('Admin.view.docentes.SugerenciaSave',{
    extend      : 'Admin.base.SaveWindow',
    alias  	    : 'widget.sugerenciasave',
    maxWidth	: 580,
    maxHeight   : 450,
    controller  : 'sugerencias',
    store	: 'SugerenciasStore',
    items 	: [
        {
            xtype 	: 'customform',
            items : [
                {
                    xtype 	    : 'customtextarea',
                    name 	    : 'sugerencia',
                    allowBlank	: false,
                    labelAlign	: 'top',
                    fieldLabel	: 'Descripción'
                },
                {
                    xtype 		: 'CbPeriodos',
                    labelAlign	: 'top'
                },
                {
                    xtype       : 'customradiogroup',
                    fieldLabel  : 'Tipo',
                    columns     : 2,
                    defaults: {
                        name		: 'tipo'
                    },
                    items: [
                        {
                            inputValue  : '2',
                            boxLabel    : 'Sugerencia'
                        },
                        {
                            inputValue  : '3',
                            boxLabel    : 'Observación'
                        }
                    ]
                }
            ]
        }
    ]
});