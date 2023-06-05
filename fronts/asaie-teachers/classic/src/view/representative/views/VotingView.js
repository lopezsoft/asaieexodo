Ext.define('Admin.view.representative.VotingView', {
    extend: 'Admin.base.CustomWindow',
    uses: [
        'Ext.layout.container.Border',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.TextItem',
        'Ext.layout.container.Fit',
        'Admin.store.representative.VotosStore'
    ],
    height  	: 600,
    width   	: 600,
    maximizable : false,
    title       : 'Elecciones escolares',
    controller  : 'representative',
	alias		: 'widget.votingview',
	config		: {
		record	: null
	},
    initComponent: function() {
        this.items = [
            {
                xtype	: 'panel',
                region	: 'center',
                layout	: 'fit',
                items: [
                    {
                        xtype       : 'votingbrowseview',
                        scrollable  : true,
                        id          : 'img-chooser-view',
                        listeners: {
                            scope   		: this,
                            selectionchange : this.onIconSelect,
                            itemdblclick    : this.onIconSelect
                        }
                    }
                ]
            }
        ];
        this.buttons = [
        	{
                xtype   : 'closebutton',
                iconAlign	: 'left'
            }
        ];
        this.callParent(arguments);
    },

    /**
     * Called whenever the user clicks on an item in the DataView. This tells the info panel in the east region to
     * display the details of the image that was clicked on
     */
    onIconSelect: function(dataview, selections) {
        const
			selected 	= selections[0],
            me      	= Admin.getApplication(),
           	ts   		= this,
            url  		= Global.getApiUrl() + '/vote/new-vote',
			record		= ts.getRecord();
			

        if (selected) {
            Ext.Msg.prompt('Código identidad', 'Por favor digite su código de votación:', function(btn, text){
                if (btn == 'ok'){
                    if (!Ext.isEmpty(text)) {
                        ts.el.mask('Procesando voto...');

                        let 
							data = {
								enrollment_id		: text,
								id					: selected.get('id'),
								candidate_id		: selected.get('candidate_id'),
								polling_station_id  : record.id,
								candidacy_id		: selected.get('candidacy_id'),
								type        		: selected.get('type')
							};
                            data = {...data,...Global.getSchoolParams()};

                        Ext.Ajax.request({
                            url     : url,
                            headers: {
                                'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
                            },
                            params  : data,
                            method  : 'POST',
                            success: function (response) {
                                // value   = Ext.decode(response.responseText);
								// console.log(value);
								let value = JSON.parse(response.responseText).records;
								value = JSON.parse(value);
								console.log(value.mensaje);
                                let msg = value.mensaje; 
                                let msgt = ""; 

                                switch ( parseInt(value.state)) {
                                    case 0 :
                                        // msg 	= "Ya habia realizado el proceso de votación";
										msgt	= "warning";
                                        break;
                                    case 5 :
                                        // msg 	= "Se realizó el proceso de voto correctamente";
										msgt	= "success";
                                        break;
                                    case 2 :
                                        // msg 	= "No se encontró registro de matricula para el código ingresado";
										msgt	= "error";
                                        break;
                                    case 3 :
                                        // msg 	= "No se realizó la operación de voto, ya que la mesa se encuentra cerrada";
										msgt	= "error";
                                        break;
                                }

                               me.showResult(msg + '.', msgt);
                               
                            },

                            failure: function (response) {
								ts.el.unmask();
                                me.onError(response.status);
                            },

                            callback: function (response) {
                                dataview.deselect(selected);
                                ts.el.unmask();
                            }
                        });
                    }else{
                        dataview.deselect(selected);
                        Ext.Msg.alert('Alerta Personero','Debe digitar un código de identidad.');
                    }
                }else{
                    dataview.deselect(selected);
                }
            });
        }
    }
});
