/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.ConfigMatOnlineView',{
    extend  : 'Admin.base.WindowCrud',
    title   	: 'Habilitar matricula en linea',
    controller  : 'configuraciones',
    alias       : 'widget.ConfigMatOnlineView',
	defaultFocus    : 'customnumberfield',
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype		: 'customnumberfield',
					name		: 'año',
					fieldLabel	: 'Año'
				},
				{
					xtype	: 'DateField',
					name	: 'fecha_ciere'
				},
				{
					xtype	: 'customcheckboxfield',
					boxLabel: 'Activo(a)',
					name	: 'estado'
				}
            ],
			dockedItems: [{
				xtype	: 'toolbarSave',
				items 	: [
					{
						xtype	: 'facebookButton'
					},
					{
						xtype	: 'youtubeButton'
					},
					'->',
					{
						xtype	: 'saveButton',
						itemId	: 'btnSave',
						iconAlign	: 'left'
					},'-',
					{
						xtype	: 'closebutton',
						itemId	: 'btnUndo',
						iconAlign	: 'left'
					}
				]
			}]
        }
    ]
});
