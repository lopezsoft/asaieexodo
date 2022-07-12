Ext.define('Admin.view.promocion.ActaGradoEncSaveView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.ActaGradoEncSaveView',
    height  : '100%',
    width   : 800,
	controller	: 'Promocion',
    defaultFocus    : 'customhtmleditor',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'customhtmleditor',
            defaults    : {
                enableFont  :  false,
                labelAlign  : 'top'
            },
			items	: [
                {
                    name        : 'encabezado'
                },
                {
                    name        : 'nombre_inst'
                },
                {
                    name        : 'resolucion'
                },
                {
                    name        : 'otorga'
                },
                {
                    name        : 'diploma'
                },
                {
                    name        : 'al_alumno'
                },
                {
                    xtype       : 'customtextarea',
                    name        : 'copia_folio'
                },
                {
                    name        : 'constancia'
                },
                {
                    fieldLabel  : 'Fecha y lugar de expedición',
                    name        : 'firma'
                },
                {
                    xtype       : 'customcheckboxfield',
                    boxLabel    : 'Mostrar firma Rector(a)/Director(a)',
                    name        : 'firma_rec'
                },
                {
                    xtype       : 'customcheckboxfield',
                    boxLabel    : 'Mostrar firma secretaria(o)',
                    name        : 'firma_sec'
                }
			]
		}		    
	]
});