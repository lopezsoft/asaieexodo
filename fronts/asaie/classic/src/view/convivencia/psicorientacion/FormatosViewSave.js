/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.psicorientacion.FormatosViewSave',{
    extend  : 'Admin.base.WindowCrud',
    alias   : 'widget.FormatosViewSave',
    title   : 'Nuevo/Editar formatos',
    maximized   : true,
    items   : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype       : 'Combo',
                    fieldLabel  : 'Acción',
                    name        : 'id_accion',
                    store       : 'AccionesStore',
                    displayField: 'nombre',
                    queryDelay	: '10',
                    valueField	: 'id',
                    itemId		: 'CbAcciones'
                },
                {
                    xtype       : 'customtextarea',
                    fieldLabel  : 'Titulo',
                    name        : 'titulo'
                },
                {
                    xtype           : 'htmleditor',
                    labelAlign	    : 'top',
                    labelStyle	    : 'font-weight:bold',
                    fieldLabel      : 'Cuerpo',
                    name            : 'cuerpo',
                    enableSourceEdit: true
                },
                {
                    xtype       : 'htmleditor',
                    labelAlign	: 'top',
                    labelStyle	: 'font-weight:bold',
                    fieldLabel  : 'Comprensión lectora',
                    name        : 'comprension_lectora',
                    enableSourceEdit: true
                }
            ]
        }
    ]
});