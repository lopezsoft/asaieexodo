Ext.define('Admin.view.representative.ControlPanelView',{
    extend  	: 'Admin.base.SaveWindow',
    title   	: 'Panel de Control',
    alias   	: 'widget.controlpanelview',
    controller  : 'representative',
	store   	: 'ControlPanelStore',
	defaultFocus	: 'customnumberfield',
    items   : [
        {
            xtype   		: 'customform',
			defaultFocus	: 'customnumberfield',
            items   : [
                {
                    xtype       : 'customnumberfield',
                    fieldLabel  : 'Votos por mesa',
					value		: 300,
					hideTrigger	: false,
                    name        : 'voting_table'
                },
				
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Discriminar por sede',
                    labelStyle  : 'font-weight:bold',
                    labelWidth  : 180,
                    defaults    : {
                        name    : 'discrimination_based'
                    },
                    items       : [
                        {
                            boxLabel    : 'Si',
                            inputValue  : '1',
                            // checked     : true
                        },
                        {
                            boxLabel    : 'No',
                            inputValue  : '2'
                        }
                    ]
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Tipo de votación',
                    labelStyle  : 'font-weight:bold',
                    labelWidth  : 180,
                    defaults    : {
                        name    : 'voting_type'
                    },
                    items       : [
                        {
                            boxLabel    : 'Local, físicamente',
                            inputValue  : 1,
                            // checked     : true
                        },
                        {
                            boxLabel    : 'Desde casa',
                            inputValue  : 2
                        }
                    ]
                },
                {
                    fieldLabel  : 'Nombre de la Institución o centro educativo',
                    name        : 'school_name',
                    hidden      : true,
                    allowBlank  : true
                },
                {
                    fieldLabel  : 'Descripción del encabezado del certificado electoral',
                    name        : 'certificate_header'
                },
                {
                    xtype       : 'customnumberfield',
                    name        : 'null_vote_attempts',
					value		: 1,
					hideTrigger	: false,
                    fieldLabel  : 'Intentos posibles para voto nulo'
                },
                {
                    xtype       : 'DateField',
                    fieldLabel  : 'Fecha inicio jornada electoral',
                    name        : 'start_date'
                },
                {
                    xtype       : 'customtimefield',
                    name        : 'start_time',
                    fieldLabel  : 'Hora de inicio'
                },
                {
                    xtype       : 'customtimefield',
                    name        : 'closing_time',
                    fieldLabel  : 'Hora de cierre'
                },

				{
					xtype		: 'yearField',
					readOnly	: true,
                }
            ]
        }
    ]
});

//editado
