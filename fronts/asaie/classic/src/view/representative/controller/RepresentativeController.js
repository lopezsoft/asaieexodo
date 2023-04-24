
Ext.define('Admin.view.representative.controller.RepresentativeController',{
    extend      : 'Admin.base.BaseController',
    alias       : 'controller.representative',
    init    : function () {
        me  = this;
        me.setConfigVar();
    },

	/**
	 * Iniciar o mostrar ventana de votación al estudiante
	 * @param {*} btn 
	 */
	onStartVotingStudent : function (btn) {
        const
            ts          = this,
            me      	= Admin.getApplication(),
			panelStore  = Ext.getStore('ControlPanelStore'),
			record		= Global.getData().enrollment[0];

		me.onStore('representative.CandidatesStore');
		me.onStore('representative.PollingStationsStore');
		me.onStore('representative.VotosStore');

		const panelRecord	= panelStore.queryRecords('voting_type', 2);
		if(!panelRecord.length > 0) {
			me.showResult('El sistema no está configurado para usar esta opción.', 'error');
			return false;
		}

		const	
			url	= Global.getUrlBase() + "representative/getStudentData";

        ts.mask();

		Ext.Ajax.request({
            url     : url,
            params  : {
                enrollment_id    : record.id
            },
            success: function(response) {
                const
                    obj 	= Ext.decode(response.responseText);
				let 	
					record	= obj.records;
				if(record.length > 0) {
					record	= record[0];	
					const
						extra   = {
							pdbTable    		: 'tp_candidates',
							pdbPolingStationId	: record.id,
							pdbType     		: 3
						};
						
					ts.unmask();
					me.setParamStore('CandidatesStore', extra, true);
					Ext.create('Admin.view.representative.VotingView',{
						record : record
					}).show();
				}else {
					me.showResult('No tiene mesa asignada para votación.', 'error');
					ts.unmask();
				}
            },
            
            failure: function(response, opts) {
                ts.unmask();
                me.onError(response.status);
            }
        });
    },

    onWhiteVote : function (btn) {
        const 
			me  	= Admin.getApplication(),
            store   = Ext.getStore('ControlPanelStore');

		me.onStore('representative.CandidatesStore');
		me.onStore('representative.CandidatesSearchStore');
		me.onStore('representative.CandidaciesStore');

		extra   = {
			pdbTable    : 'tp_white_vote', 
			pdbType     : 1
		};

		me.setParamStore('CandidatesStore',extra);

		if (store.getCount() > 0) {
			Ext.create('Admin.view.representative.WhiteVote',{
				title	: 'Ficha de voto en blanco'
			}).show();
		} else {
			me.showResult('Por favor configure el panel de control...');
		}
    },

	/**
	 * Crea el modal o vista de grados por mesa
	 * @param {*} btn 
	 */
    onCreateDegreesPerTable : function (btn) {
        var  me  = Admin.getApplication();

            me.onStore('representative.DegreesPerTableStore');
            me.onStore('general.GradosStore');
            me.onStore('general.GrupoStore');

            extra = {
                pdbTable    			: 'tp_degrees_per_table',
                pdbPolling_stattion_id 	: btn.up('window').down('grid').getSelection()[0].get('id')
            };

            me.setParamStore('DegreesPerTableStore',extra,false);

       		Ext.create('Admin.view.representative.DegreesPerTable',{
				title	: 'Grados por mesa de votación',
				records	: btn.up('window').down('grid').getSelection()[0]
			}).show();

    },
	 /**
	  * Crea el modal o vista de las candidaturas
	  * @param {*} btn 
	  */
    onCandidacies : function (btn) {
        var  me  = Admin.getApplication();
            me.onStore('representative.CandidaciesStore');
            Ext.create('Admin.view.representative.Candidacies',{
				title	: 'Ficha de candidaturas'
			}).show();
    },

    /**
     * Funcion que crea la vista del panel de control
     * @param btn
     */

     onControlPanel : function (btn) {
        let me  = Admin.getApplication();
            me.onStore('representative.ControlPanelStore');
            Ext.create('Admin.view.representative.ControlPanel').show();
     },


    /**
     * Funcion para crear la vista de las mesas de votacion
     * @param btn
     */
    onPollingStations : function (btn) {
       const
	   	me  	= Admin.getApplication(),
        store   = Ext.getStore('ControlPanelStore');
		me.onStore('representative.PollingStationsStore');
		me.onStore('general.SedesStore');
		me.onStore('general.GradosStore');
		me.onStore('representative.TableHeadquartersStore');
		me.onStore('representative.JuriesStore');
		if (store.getCount() > 0) {
			Ext.create('Admin.view.representative.PollingStations').show();
		}else{
			me.showResult('Por favor configure el panel de control...');
		}
    },

    /**
     * Funcion para crear la ventana o vista de los candidatos
     * @param btn
     */
    onCandidates    : function (btn) {
        const 
			me  	= Admin.getApplication(),
            store   = Ext.getStore('ControlPanelStore');

		me.onStore('representative.CandidatesStore');
		me.onStore('representative.CandidatesSearchStore');
		me.onStore('representative.CandidaciesStore');

		extra   = {
			pdbTable    : 'tp_candidates', 
			pdbType     : 2,
		};
		
		me.setParamStore('CandidatesStore',extra);
		
		extra   = {
			fields		: JSON.stringify(['nombres','grado','id_group', 'sede'])
		};
		me.setParamStore('CandidatesSearchStore', extra);

		if (store.getCount() > 0) {
			Ext.create('Admin.view.representative.Candidates',{
				title	: 'Ficha de candidatos'
			}).show();
		} else {
			me.showResult('Por favor configure el panel de control...');
		}
    },


    /**
     * Funcion para crear la vista de las sedes por mesa
     * @param btn
     */
    onCreateHeadquarters   : function (btn) {
        var me      = Admin.getApplication(),
            store   = Ext.getStore('ControlPanelStore'),
            records = btn.up('window').down('grid').getSelection()[0];

        record  = store.data.items[0].data;

        if (record.discrimination_based == 1) {

            extra = {
                pdbTable    		: 'tp_table_headquarters',
                pdbPolingStationId	: records.get('id')
            };
            me.setParamStore('TableHeadquartersStore',extra);
            Ext.create('Admin.view.representative.TableHeadquarters',{
				records: records
			}).show();

        }else {
            me.showResult('El módulo no está configurado para trabajar sedes.');
        }
    },



    /**
     * Funcion para crear la vista de los jurados de mesa
     * @param btn
     */
    onCreateJuries : function (btn) {
        const 
            me      = Admin.getApplication(),
            record  = btn.up('window').down('grid').getSelection()[0];
        extra = {
            pdbTable    		: 'tp_juries',
            pdbPolingStationId  : record.get('id')
        };
        me.setParamStore('JuriesStore',extra);
        Ext.create('Admin.view.representative.Juries',{
			title	: 'Lista de jurados',
			record	: record
		}).show();
    },

    onLoadStudent   : function (btn) {
        const
            me      = Admin.getApplication(),
            extra   = {};

        me.setParamStore('CandidatesSearchStore',extra);
        Ext.create('Admin.view.representative.CandidatesSearchView',{
			title	: 'Ficha listado de estudiantes'
		}).show();
    },

    onImportStudents : function (btn) {
        var win     = btn.up('window'),
            select  = win.down('grid').getSelection(),
            me      = Admin.getApplication(),
            winCan  = Ext.ComponentQuery.query('candidatesview')[0];

        if (select.length === 1) {
			const 
				record		= select[0];
			
            winCan.down('#idMatric').setValue(record.get('id'));
            winCan.down('#names').setValue(record.get('nombres'));
            win.close(true);
        }else {
            me.showResult('Seleccione un estudiante por favor...');
        }
    },

	/**
	 * Iniciar Jornada de vitación
	 * @param {*} btn 
	 */
    onStartVoting : function (btn) {
        const
			me  = Admin.getApplication();
		const 
			store   = Ext.getStore('ControlPanelStore');

            me.onStore('representative.CandidatesStore');
            me.onStore('representative.PollingStationsStore');
            me.onStore('representative.VotosStore');

            extra   = {
                pdbTable    : 'tp_candidates',
                pdbType     : 3
            };

            me.setParamStore('CandidatesStore',extra);
		if (store.getCount() > 0) {
            Ext.create('Admin.view.representative.StartVoting',{
				title: 'Abrir mesas de jornada electoral'
			}).show();
		}else{
			me.showResult('Por favor configure el panel de control...');
		}

    },

    /**
     * Abrir mesa de votacion
     * @param btn
     */

	onOpenVoting : function (btn) {
        const
			record  	= btn.up('window').down('grid').getSelection()[0],
            me      	= Admin.getApplication(),
            store   	= btn.up('window').down('grid').getStore(),
			panelStore  = Ext.getStore('ControlPanelStore');

		const panelRecord	= panelStore.queryRecords('voting_type', 2);

		const
			extra   = {
                pdbTable    		: 'tp_candidates',
				pdbPolingStationId	: record.get('id'),
                pdbType     		: 3
            };

        me.setParamStore('CandidatesStore', extra, true);
			
        if (parseInt(record.get('state')) === 1) { // Abre la mesa
            Ext.Msg.show({
                title	: 'Abrir mesa',
                message	: 'Desea abrir esta mesa de votación?',
                buttons	: Ext.Msg.YESNO,
                icon	: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        const data = {
                            state      	: 2
                        };
                        record.set(data);
                        store.sync({
                            success: function () {
								if(!panelRecord.length > 0) {
									Ext.create('Admin.view.representative.VotingView',{
										record : record
									}).show();
								}
							    store.reload();
                            },

                            failure: function () {
                                me.showResult('No se ha podido abrir la mesa de votación...');
                            }
                        });
                    }
                }
            });
        }else if (record.get('state') == 2){
			if(!panelRecord.length > 0) {
				Ext.create('Admin.view.representative.VotingView',{
					record : record
				}).show();
			}
        }
        else{
            me.showResult('No se puede realizar la operación');
        }
    },

    /**
     * Cerrar mesa de votacion
     * @param btn
     */
	 onCloseVoting : function (btn) {
        var record  = btn.up('window').down('grid').getSelection()[0],
            me      = Admin.getApplication(),
            store   = btn.up('window').down('grid').getStore();

        if (parseInt(record.get('state')) !== 0) {
            Ext.Msg.show({
                title	: 'Cerrar mesa',
                message	: 'Desea cerrar esta mesa de votación?',
                buttons	: Ext.Msg.YESNO,
                icon	: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        const data = {
                            state	: 0
                        };
                        record.set(data);
                        store.sync({
                            success: function () {
                                store.reload();
                                me.showResult('Se realizó el cierre correctamente');
                            },
                            failure: function () {
                                me.showResult('No se ha podido cerrar la mesa de votación...');
                            }
                        });
                    }
                }
            });
        }else{
            me.showResult('Ya la mesa se encuentra cerrada');
        }
    },


    onPrint : function (btn) {
        const
            me  = Admin.getApplication();
            me.onStore('general.SedesStore');
            me.onStore('general.GradosStore');
            Ext.create('Admin.view.representative.RepresentativeReportView',{
				title	: 'Ficha de informes'
			}).show();
    },

    onResult    : function (btn) {
        var win = null,
            me  = this;

        win = me.app.getWindow(null,'Admin.view.representative.PersoneroReportResultView');

        win.show();
    },

    onResults    : function (btn) {
        Ext.create('Admin.view.representative.RepresentativeReportResultView',{
			title: 'Informes de resultados electorales'
		}).show();
    },

    onSetReport : function (btn) {
        let url     = 'representative/getCertificate',
            param   = {},
            win     = btn.up('window');

        if (win.alias == "widget.representativereportview") {
            var grado   = win.down('#comboGrados').getSelection(),
                sede    = win.down('#comboSedes').getSelection(),
                report  = win.down('#comboReport').getSelection();

            param = {
                pdbGrado	: grado.get('id'),
                pdbSede		: sede.get('ID'),
                pdbReport	: report.get('id')
            };
		}else if(win.alias == "widget.representativereportresultview"){
			const 
				report  = win.down('#comboReport').getSelection();
				// url     = 'representative/getResults';
				url     = 'reports/election-results';

				param = {
					pdbReport: report.get('id')
				};

        }else{
			console.log("win = ",win.alias)

			url     = 'representative/report_resultados';
           	var  report  = win.down('#comboReport').getSelection();

            param = {
                pdbReport: report.get('id')
            };
        }

        this.onGenReport(btn,url,param);
    }
});
