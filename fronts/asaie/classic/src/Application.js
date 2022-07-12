/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Admin.Application', {
    extend: 'Ext.app.Application',
    name: 'Admin',
    requires: [
        'Admin.sockets.data.proxy.SocketIo',
        'Admin.sockets.Socket',
        'Ext.util.TaskRunner',
        'Admin.view.language.Es',
        'Admin.security.TokenStorage',
        'Admin.view.config.Configs',
        'Admin.grid.CustomGrid',
        'Admin.forms.CustomForm',
        'Admin.view.home.Dashboard',
        'Admin.view.main.*',
        'Admin.view.auth.*',
        'Ext.window.Toast',
        'Admin.store.*'
    ],
    stores: [
        // TODO: add global / shared stores here
        'charts.RetiredStore',
        'charts.RegisteredStore',
        'charts.TeachersStore',
        'NavigationTree',
    ],


    defaultToken: 'login',

    // The name of the initial view to create. This class will gain a "viewport" plugin
    // if it does not extend Ext.Viewport.
    //
    // mainView: 'Admin.view.main.Main',

    init: function() {
        me = this;
        Ext.enableAriaButtons = false;
        Ext.enableAriaPanels = false;
        Ext.supports.DeviceMotion = true;
        Ext.supports.Orientation = true;
        Ext.supports.OrientationChange = true;
        Ext.supports.Audio = true;
        Ext.util.Format.thousandSeparator = '.';
        if (!localStorage.getItem('collapsing')) {
            localStorage.setItem('collapsing', 0);
        }
    },
    launch: function() {
        Ext.Date.patterns = {
            ISO8601Long: "d-m-Y H:i:s",
            ISO8601Short: "d-m-Y",
            ShortDate: "J/n/Y",
            LongDate: "l, d F, Y",
            FullDateTime: "l, d F, Y g:i:s A",
            MonthDay: "d F",
            ShortTime: "g:i A",
            LongTime: "g:i:s A",
            SortableDateTime: "d-m-Y\\TH:i:s",
            UniversalSortableDateTime: "d-m-Y H:i:s",
            YearMonth: "F, Y"
        };
        // TODO - Launch the application
        var me = this;

        Ext.onReady(function() {
            me.onCreateStores();
			var loadingMask = Ext.get('global-spinner');
			// Ocultando la animación
			if (loadingMask) {
				loadingMask.fadeOut({
					duration: 500,
					remove: true
				});
			}

			toastr.options = {
				"closeButton": false,
				"debug": false,
				"newestOnTop": false,
				"progressBar": false,
				"positionClass": "toast-top-full-width",
				"preventDuplicates": false,
				"onclick": null,
				"showDuration": "300",
				"hideDuration": "1000",
				"timeOut": "5000",
				"extendedTimeOut": "1000",
				"showEasing": "swing",
				"hideEasing": "linear",
				"showMethod": "fadeIn",
				"hideMethod": "fadeOut"
			};

			if(AuthToken.isAuthenticated()) {
				me.setMainView('Admin.view.main.Main');
				mainView = me.getMainView();
				mainView.getController().redirectTo('dashboard', true);
				mainView.getController().onToggleNavigationSize(null);
				const token	= AuthToken.recoverParams();
				const msg	= (token)	? token.user.first_name + ' ' + token.user.last_name : '';
				toastr.success('Hola ' + msg + ', bienvenid@ al sistema de notas ASAIE ÉXODO.');
			}else {
				Ext.create({
					xtype: 'login'
				});
			}

        });
    },

    onCreateStores: function() {
        var me = Admin.getApplication();
        me.onStore('general.MatriculadosStore');
        me.onStore('general.JornadasStore');
        me.onStore('general.GrupoStore');
        me.onStore('general.GradosStore');
        me.onStore('general.SedesStore');
        me.onStore('general.PeriodosStore');
        me.onStore('promocion.ActaPromoObsStore');
        me.onStore('promocion.ListaMatriculaStore');
        me.onStore('admin.DocentesDirGrupoStore');
        me.onStore('general.MatricularAntiguosStore');
        me.onStore('promocion.PromovidosStore');
        me.onStore('promocion.PromotedObservationStore');
        me.onStore('general.ConstanciasStore');
        me.onStore('general.CertificatesHeader');
        me.onStore('representative.CandidatesSearchStore');
        me.onStore('docentes.RecuperacionesPeriodicasStore');
        me.onStore('general.NivelesAcademicosStore');
        me.onStore('docentes.CargaStore');
        me.onStore('docentes.NotasStore');
        me.onStore('docentes.ColumnDocentesStore');
        me.onStore('docentes.ParceladorStore');
        me.onStore('docentes.BancoCliStore');
        me.onStore('docentes.CargaAgrupadaStore');
        me.onStore('docentes.LogrosStore');
        me.onStore('docentes.SugerenciasStore');
        me.onStore('docentes.perfil.PerfilDocentesStore');
        me.onStore('docentes.LogrosNotasStore');
        me.onStore('docentes.LogrosNotasEstudiantesStore');
        me.onStore('docentes.SugerenciasEstudiantesStore');
        me.onStore('docentes.PreinformeStore');
        me.onStore('general.DesempenosStore');
        me.onStore('general.CompetenciasDocentesStore');
        me.onStore('general.TipoProcesosStore');
        me.onStore('docentes.ImportarLogrosIndStore');
        me.onStore('general.EscalaNacionalStore');
        me.onStore('docentes.ImportarDescriptoresStore');
        me.onStore('docentes.LogrosEstandarStore');
        me.onStore('docentes.SugerenciasInsertStore');
        me.onStore('representative.ControlPanelStore');
    },

    onAppUpdate: function() {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function(choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    },
    // Funcion que retorna el tipo de dispositivo  donde se está ejecutando la aplicacion (Desktop, Tablet, Phone)
    getProfileApp: function() {
        return this.profileApp;
    },

    /*
     * URL Base de la aplicacion
     *
     */
    getUrlBase: function() {
        return Global.getUrlBase();
    },

    urlLocation: function() {

        return Global.getUrlLocation();
    },

	isAuthenticated: () => {
		return false;
	},

    /**
     * Funcion para configurar la URL de los STORES
     * @param xStore  Nombre del Store
     */

    setUrlProxy: function(xStore) {
        var me = this,
            baseUrlSys = me.getUrlBase(),
            datos = null,
            proxy = null,
            pUrl = null,
            pApi = null;

        datos = Ext.getStore(xStore);

        proxy = datos.getProxy();
        pUrl = proxy.url;
        pApi = proxy.getApi();

        if (pUrl == '') {
            cCreate = baseUrlSys + pApi.create;
            cDestroy = baseUrlSys + pApi.destroy;
            cRead = baseUrlSys + pApi.read;
            cUpdate = baseUrlSys + pApi.update;

            api = {
                create: cCreate,
                read: cRead,
                update: cUpdate,
                destroy: cDestroy
            };

            proxy.setApi(api);

        } else {
            proxy.setUrl(baseUrlSys + pUrl);
        }
    },

    /*
     Funcion para crear ventanas
     @cTitle : String, Titulo de la ventana
     @cWin   : String, nombre de la ventana a crear
     @return : Object, valor de retorno,
     */
    getWindow: function(cTitle, cWin) {

        return Ext.create(cWin);
    },

    /*
     Funcion para crear los Stores
     @xStore : STRINS, Nombre del Store
     */
    onStore: function(xStore) {
        var cStore = '';

        cStore = 'Admin.store.' + xStore;

        new Ext.create(cStore);
    },


    /*
     funcion que muestra mensaje de espera
     */
    onMsgWait: function(ms) {
        if (Ext.isEmpty(ms)) {
            Ext.Msg.wait(AppLang.getSMsgLoading());
        } else {
            Ext.Msg.wait(ms);
        };
    },

    onMsgClose: function() {
        Ext.Msg.hide();
    },

    /*
     Funcion para setear los parametrps de un Data Store y recargarlo
     @cStore : String, Nombre del Store
     @extParam : array
     @reload : Bolean, indica si se recarga el Store después de setearlo (Opcional),
     */
    setParamStore: function(cStore, extParam, reload) {
        var datos = Ext.getStore(cStore);
        if (datos) {
            proxy = datos.getProxy();
            proxy.setExtraParams(extParam);
            if (reload == true) {
                datos.reload();
            }
        }
    },

    /*
     Funcion para extraer los parametrps de un Data Store
     @cStore : String, Nombre del Store
     RETURNS : Devuelve el objeto con los paramentros
     */

    getParamStore: function(cStore) {
        if (Ext.isEmpty(cStore)) {
            this.onAler('El parametro del STORE está vacío : getParamStore');
            return false;
        } else {
            var datos = Ext.getStore(cStore);
            proxy = datos.getProxy();

            return proxy.getExtraParams();
        };
    },

    /*
     Funcion para mostrar un mesaje al usuario cuando realiza una operacion
     @text : String, Mensaje a mostrar al usuario
     */

    showResult: function(text, type) {
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
        if (type) {
            switch (type) {
                case 'success':
                    toastr.success(text);
                    break;
                case 'warning':
                    toastr.warning(text);
                    break;
                case 'error':
                    toastr.error(text);
                    break;
                default:
                    toastr.info(text);
                    break;
            }
        } else {
            toastr.info(text);
        }
    },

    /*
     Funcion para eliminar el registro seleccionado en el grid
     @retur : String, Mensaje al usuario
     */

    onGridDelete: function(btn, e, eOpts) {
        var cbtn = btn,
            me = this;

        Ext.Msg.show({
            title: 'Elimiar datos',
            message: 'Desea eliminar el registro?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            fn: function(btn) {
                if (btn === 'yes') {
                    var grid = cbtn.up('grid'),
                        records = [],
                        store = null;
                    if (!grid) {
                        grid = cbtn.up('window').down('grid');
                    }
                    if (!grid) {
                        grid = cbtn.up('form').down('grid');
                    }
                    if (grid) {
                        store = grid.getStore();
                        records = grid.getSelectionModel().getSelection();
                        if (records.length > 0) {
                            grid.mask('Borrando datos');
                            store.remove(records);
                            store.sync({
                                success: function(b, o) {
                                    grid.unmask();
                                    me.showResult('Se ha realizado la acción de borrado');
                                    store.reload();
                                },
                                failure: function(b, o) {
                                    grid.unmask();
                                    me.showResult('No se ha realizado la acción de borrado');
                                    store.reload();
                                }
                            });
                        } else {
                            me.showResult('Debe seleccionar un registro a borrar.');
                        }
                    } else {
                        me.showResult('Error desconocido. Comuniquese con el soporte técnico.');
                    }

                }
            }
        });

    },

    onRecordDelete: function(records, cStore) {
        var me = this;
        if (Ext.isEmpty(cStore)) {
            me.onAler('El parametro del STORE está vacío : store');
            return false;
        }
        Ext.Msg.show({
            title: 'Elimiar datos',
            message: 'Desea eliminar el registro?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            alwaysOnTop: true,
            fn: function(btn) {
                if (btn === 'yes') {
                    me.onMsgWait();
                    var
                        store = Ext.getStore(cStore);
                    store.remove(records);
                    store.sync({
                        success: function(b, o) {
                            Ext.Msg.hide();
                            me.showResult('Se ha realizado la acción de borrado');
                            store.reload();
                        },
                        failure: function(b, o) {
                            Ext.Msg.hide();
                            me.showResult('No se ha realizado la acción de borrado');
                            store.reload();
                        }
                    });
                }
            }
        });

    },



    /*
     Funcion para quitar el filtro del grid
     */
    onClearFilterGrid: function(btn, e, eOpts) {
        var win = btn.up('window');

        if (win == null) {
            grid = btn.up('grid');
        } else {
            grid = win.down('grid');
        }

        grid.filters.clearFilters();
    },

    /*
     Funcion para cerrar la ventana activa.
     */
    onCloseWin: function(btn, e, eOpts) {
        var win = btn.up('window'),
            form = null;

        if (!Ext.isEmpty(win)) {
            form = win.down('form');
        }

        if (!form == null) {
            form.getForm().reset();
        }

        if (!Ext.isEmpty(win)) {
            win.fireEvent('cancel', win);
            win.fireEvent('closed', win);
            win.close();
        }
    },

    onError: function(msgError) {
        var Msg = Ext.create('Ext.window.MessageBox', {
            alwaysOnTop: true,
            modal: true,
            closeAction: 'destroy'
        }).show({
            title: 'ASAIE ERROR',
            msg: "Mensaje de error : " + msgError,
            icon: Ext.MessageBox.ERROR,
            buttons: Ext.Msg.OK
        });

    },

    onAler: function(msgAler) {
        Ext.MessageBox.show({
            title: 'ASAIE ALERTA',
            msg: msgAler,
            alwaysOnTop: true,
            icon: Ext.MessageBox.INFO,
            buttons: Ext.Msg.OK
        });
    },

    /**
     * Permite abrir un enlace en una nueva ventana
     * @param cUrl String
     */
    onOpenUrl: function(cUrl, target) {
        var
            Url = encodeURI(cUrl);
        window.open(Url, target);
    }
});
