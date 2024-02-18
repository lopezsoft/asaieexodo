Ext.define('Admin.view.representative.PollingStationsView',{
    extend  	: 'Admin.base.SaveWindow',
    alias   	: 'widget.pollingstationsview',
    controller  : 'representative',
    title   	: 'Mesas de votación',
    maxHeight  	: 480,
	store   	: 'PollingStationsStore',
    items   : [
        {
            xtype   	: 'customform',
            defaultType : 'customtextarea',
            defaultFocus : 'customtextarea',
            items   : [
                {
                    fieldLabel  : '* Nombre de la mesa',
                    name        : 'table_name',
					autofocus	: true,
                },
                {
                    xtype       : 'customnumberfield',
                    fieldLabel  : '* Número de la mesa',
                    name        : 'table_number',
                    keyNavEnabled	: true,
                    value       : 1,
                    minValue 	: 1,
                    maxValue	: 20
                },
                {
                    fieldLabel  : 'Ubicación, dirección',
                    name        : 'table_location',
					allowBlank	: true,
                },
				{
                    xtype		: 'yearField',
					readOnly	: true,
                },
            ]
        }
    ]
});


