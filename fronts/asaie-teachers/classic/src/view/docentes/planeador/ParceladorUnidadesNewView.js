/**
 * Created by LOPEZSOFT on 10/12/2015.
 */
Ext.define('Admin.view.docentes.ParceladorUnidadesNewView', {
    extend  : 'Admin.base.CustomWindow',
    alias   : 'widget.ParceladorUnidadesNewView',
    controller: 'parcelador',
    height  : 300,
    items: [
        {
            xtype           : 'customform',
            defaultType     :'customtextarea',
            items   : [
                {
                    fieldLabel  : 'Unidades / Ejes temáticos',
                    name        : 'ejes_tematicos'
                },
                {
                    fieldLabel  : 'Temas / Contenidos',
                    name        : 'temas_contenidos'
                }
            ]
        }
    ]
});