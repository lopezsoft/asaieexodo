Ext.define('Admin.view.promocion.CertificatesHeadersSave' ,{
    extend	        : 'Admin.base.SaveWindow',
    alias 	        : 'widget.certificatesheaderssave',
    xtype 	        : 'certificatesheaderssave',
    controller	    : 'Promocion',
    defaultFocus    : 'customhtmleditor',
    store           : 'CertificatesHeader',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'customhtmleditor',
			items	: [
                {
                    enableFont  : true,
                    labelAlign  : 'top',
                    fieldLabel  : 'Encabezado',
                    name        : 'header1',
                },
                {
                    enableFont  : true,
                    labelAlign  : 'top',
                    fieldLabel  : 'Resolución',
                    name        : 'header2'
                },
                {
                    enableFont  : true,
                    labelAlign  : 'top',
                    fieldLabel  : 'Datos de expedición',
                    name        : 'body'
                },
                {
                    enableFont          : true,
                    name                : 'message',
                    enableSourceEdit    : false,
                    enableLinks         : false,
                    enableLists         : false,
                    height              : 120
                },
                {
                    xtype       : 'customtextarea',
                    name        : 'resolution'
                },
                {
                    xtype       : 'customtextarea',
                    labelAlign  : 'top',
                    fieldLabel  : 'Fecha y lugar de expedición',
                    name        : 'expedition'
                },
                {
                    xtype       : 'customcheckboxfield',
                    boxLabel    : 'Mostrar firma Rector(a)/Director(a)',
                    name        : 'rector_firm'
                },
                {
                    xtype       : 'customcheckboxfield',
                    boxLabel    : 'Mostrar firma secretaria(o)',
                    name        : 'signature_secretary'
                },
                {
                    xtype       : 'customcheckboxfield',
                    boxLabel    : 'Mostrar número de certificado',
                    name        : 'show_number'
                },
				{
					xtype       : 'customtextarea',
					labelAlign  : 'top',
					fieldLabel  : 'Nombre del certificado',
					name        : 'show_number_message'
				},
                {
                    xtype		: 'customradiogroup',
                    columns		: 2,
                    vertical	: true,
                    fieldLabel	: 'Tipo',
                    items		: [
                        {
                            boxLabel	: 'Educación básica y media',
                            name		: 'type',
                            inputValue	: 4
                        },
                        {
                            boxLabel	: 'Adultos',
                            name		: 'type',
                            inputValue	: 5
                        }
                    ]
                }
			]
		}		    
	]
});
