/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.view.docentes.ParceladorCliNewView', {
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.ParceladorCliNewView',
    controller: 'parcelador',
    requires : [
      	'Admin.store.general.CompetenciasStore',
		'Admin.combo.CbTipoProcesos'
    ],
    height  : 450,
	defaultFocus    : 'customtextarea',
    items: [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype       : 'customtextarea',
					labelAlign	: 'top',
                    fieldLabel  : 'Descripción',
                    name        : 'descripcion'
                },
                {
                    xtype       : 'customtextarea',
					labelAlign	: 'top',
                    fieldLabel  :  'Estrategias de aprendizaje',
                    allowBlank  : true,
                    name        : 'estra_apren'
                },
                {
                    xtype       : 'Combo',
					labelAlign	: 'top',
                    fieldLabel  : 'Competencia',
                    store       : 'CompetenciasStore',
                    name		: 'id_competencia',
                    displayField: 'competencia',
                    valueField	: 'id',
                    itemId		: 'comboCompetencias',
					value		: 0
                },
                {
					xtype	: 'CbTipoProcesos',
					value	: 0
                }
            ]
        }
    ]
});
