Ext.define('Admin.view.representative.ControlPanel',{
    extend  	: 'Admin.base.WindowCrud',
    title   	: 'Panel de control',
    controller  : 'representative',
    alias       : 'widget.controlpanel',
	modalView	: 'Admin.view.representative.ControlPanelView',
	store   	: 'ControlPanelStore',
    items   : [
        {
            xtype   : 'customgrid',
            store   : 'ControlPanelStore',
            columns: [
                {
                    xtype: 'rownumberer'
                },
                {
                    text        : 'Votos por mesa',
                    dataIndex   : 'voting_table',
                    width       : 120
                },
                {
                    text        : 'Discriminar por sede',
                    dataIndex   : 'discrimination_based',
                    width       : 160,
                    renderer 	:  function(val) {
                        if (val == 1) {
                            value   = '<span style="color:#7e55ef;"> <b> Si </b></span>';
                        }else{
                            value   = '<span style="color:#7e12ef;"> <b> No </b></span>';
                        }
                        return value;
                    }
                },
                {
                    text        : 'Tipo de votación',
                    dataIndex   : 'voting_type',
                    width       : 170,
                    renderer 	:  function(val) {
                        if (val == 1) {
                            value   = '<span style="color:#7e55ef;"> <b> Local, fisicamente </b></span>';
                        }else{
                            value   = '<span style="color:#7e55ef;"> <b> Desde casa </b></span>';
                        }
                        return value;
                    }
                },
                {
                    text        : 'Intentos posibles para voto nulo',
                    dataIndex   : 'null_vote_attempts',
                    width       : 220
                },
                {
                    text        : 'Fecha de inicio de la jornada',
                    dataIndex   : 'start_date',
                    width       : 200
                }
            ],
            dockedItems : [
                {
                    xtype   : 'toolbarCrud',
                    items   : [
                        {
                            xtype   : 'addButton'
                        },
                        {
                            xtype   : 'editButton'
                        },
                        {
                            xtype   : 'closebutton'
                        }
                    ]
                },
                {
                    xtype   : 'pagination',
					itemId  : 'pToolbar'
                }
            ]
        }
    ]
});
