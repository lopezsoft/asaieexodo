/**
 * Created by LOPEZSOFT on 7/12/2015.
 */
Ext.define('Admin.view.docentes.ParceladorConTemNewView', {
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.ParceladorConTemNewView',
    controller: 'parcelador',
    height  : 250,
    defaultFocus : 1,
    items: [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Tipo',
                    store       : 'ParceladorItemsConTemStore',
                    name		: 'tipo',
                    displayField: 'descripcion',
                    valueField	: 'id',
                    itemId		: 'comboTipoConTem'
                },
                {
                    xtype       : 'customtextarea',
                    fieldLabel  : 'Descripción',
                    name        : 'descripcion'
                }
            ]
        }
    ]
});