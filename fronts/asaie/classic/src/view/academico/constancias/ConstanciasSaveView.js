Ext.define('Admin.view.academico.ConstanciasSaveView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.ConstanciasSaveView',
	controller	: 'academico',
    defaultFocus: 'customhtmleditor',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewStudyConstancy() + ' - ' + Global.getYear());
    },
    store   : 'ConstanciasStore',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'customhtmleditor',
			items	: [
                {
                    labelAlign  : 'top',
                    fieldLabel  : 'Encabezado',
                    name        : 'header1'
                },
                {
                    labelAlign  : 'top',
                    fieldLabel  : 'Resolución',
                    name        : 'header2'
                },
                {
                    labelAlign  : 'top',
                    fieldLabel  : 'Datos de expedición',
                    name        : 'body'
                },
                {
                    name        : 'message',
                    enableSourceEdit    : false,
                    enableLinks         : false,
                    enableLists         : false,
                    height              : 120
                },
                {
                    name: 'resolution',
                    height: 120
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
                    boxLabel    : 'Mostrar número de constancia o certificado',
                    name        : 'show_number'
                }
			]
		}		    
	]
});