Ext.define('Admin.view.docentes.observador.FoftDifView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.FoftDifView',
    width 	: 650,
    height	: 450,
	controller	: 'observador',
    items : [
    	{
			xtype	: 'customform',
			items	: [
				{
					xtype 		: 'customtextarea',
					name		: 'descripcion',
					fieldLabel	: 'Descripción de la fortaleza o dificultad:',
					height		: 200,
					emptyText	: 'Digite la descripción de la fortaleza o dificultad'
				},
				{
					xtype 		: 'Combo',
					name		: 'tipo',
					fieldLabel	: 'Tipo de fortaleza o dificultad:',
				    displayField: 'descripcion',
				    valueField	: 'id',
				    itemId		: 'CbFoftDif',
				    store		: 'ModelosStore'
				}
			]
		}		    
	]
});