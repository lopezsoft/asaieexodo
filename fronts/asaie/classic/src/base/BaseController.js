/**
 * Created by LEWIS on 18/11/2015.
 */

Ext.define('Admin.base.BaseController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.base',

    /*
     * Propiedades personalizadas
     *
     */

    app : '', // Almacena la instancia de la aplicacion

    urlBase: '', // Almacena la URL base de la aplicacion para realizar consultas al servidor

    urlLoc: '', // Almacena la URL principal del sitio para cuando se cierra sesión

    config: {
        queryComp: null
    },

    init: function () {
        me = this;
        me.control({
            'PerfilUserView button#btnSave' : {
                click : this.onSavePerfil
            }
        });
    },

    /*
     Funcion para mostrar un mesaje al usuario cuando realiza una operacion
     @text : String, Mensaje a mostrar al usuario
     */

    showResult : function(text) {
        Ext.toast({
            html: text,
            closable: false,
            align	: 'tr',
            slideInDuration: 400,
            minWidth: 200,
            //border 	: false,
            frame	: true
        });
    },

    onCreateQueryComp: function () {
        var
            me = this;
        if (!me.getQueryComp()) {
            me.setQueryComp(Ext.ComponentQuery.query('Main')[0].lookupReference('mainCardPanel'));
        }
    },

    mask: function (message) {
        var
            me = this,
            Comp = me.getQueryComp();
        if (!Comp) {
            me.onCreateQueryComp();
            Comp = me.getQueryComp();
        }
        Comp.el.mask(message ? message : 'Cargando');
    },

    unmask: function () {
        this.onCreateQueryComp();
        var
            me = this,
            Comp = me.getQueryComp();
        if (Comp) {
            Comp.el.unmask();
        }
    },


    /**
     * Cambia al menú indicado
     *
     */
    onCloseView : function(){
        this.onRestoreMainCardPanel();
    },

    onRestoreMainCardPanel: function () {
        if(localStorage.getItem('oldRoute') == localStorage.getItem('currentRoute')){
            this.redirectTo('dashboard', true);
        }else{
            this.redirectTo((localStorage.getItem('oldRoute')) ? localStorage.getItem('oldRoute') : 'dashboard', true);
        }
    },

	/**
	 * Funcion que se ejcuta cuando se pulsa el boton deshacer
	 * en una viasta con grid
	 * @param btn
	 * @constructor
	 */

	onClickUndo : function(btn) {
		var win 	= btn.up('window'),
			grid 	= win.down('grid'),
			store 	= grid.getStore();
		store.rejectChanges();
	},

    onExportExcel : function (btn) {
    /*	Ext.require(
			'Ext.exporter.text.CSV',
			'Ext.exporter.excel.Xlsx'
		);
    	Ext.onReady(function () {
    		var
				grid =  btn.up('grid');

			grid.saveDocumentAs({
				type: 'xlsx',
				title: 'Archivo excel',
				fileName: 'Archivo excel.xlsx'
			});
		});*/
    },

    onExportCSV : function (btn) {
        var
            component = btn.up('grid'),
            Exp     = Ext.ux.exporter.Exporter,
            data    = 'data:text/csv;base64,' + Exp.exportAny(component,'csv'),
            URL     = "Archivo delimitado." + Exp.getFormatterByName('csv').extension,
            link = document.createElement("a");
        link.download = URL;
        link.href = data;
        link.click();
    },

    /*
     * Almacena los valores en las propiedades
     *
     */

    setConfigVar: function () {
        me          = this;

        me.app      = Admin.getApplication();
        me.urlBase  = me.app.getUrlBase();
        me.urlLoc   = me.app.urlLocation();

    },

    /**
     * Funcion para cerrar sesión
    */

    onCloseSesion : function () {
        Ext.Msg.show({
            title	: 'Cerrar sesión',
            message	: 'Desea cerrar la sesión?',
            buttons	: Ext.Msg.YESNO,
            icon	: Ext.Msg.QUESTION,
            fn: function(btn) {
                if (btn === 'yes') {
                    AuthToken.onLogout();
                }
            }
        });
    },

    onToggleNavigationSize: function (btn) {
        var me              = this,
            refs            = me.getReferences(),
            navigationList  = refs.navigationTreeList,
            wrapContainer   = refs.mainContainerWrap,
            collapsing      = !navigationList.getMicro(),
            new_width       = collapsing ? 64 : 250;
        if(!btn){
            collapsing  = (parseInt(localStorage.getItem('collapsing')) > 0) ? true : false;
            new_width   = collapsing ? 64 : 250;
        };

        localStorage.setItem('collapsing', collapsing ? 1: 0);

        if (Ext.isIE9m || !Ext.os.is.Desktop) {
            Ext.suspendLayouts();

            refs.senchaLogo.setWidth(new_width);

            navigationList.setWidth(new_width);
            navigationList.setMicro(collapsing);

            Ext.resumeLayouts(); // do not flush the layout here...

            // No animation for IE9 or lower...
            wrapContainer.layout.animatePolicy = wrapContainer.layout.animate = null;
            wrapContainer.updateLayout();  // ... since this will flush them
        }
        else {
            if (!collapsing) {
                // If we are leaving micro mode (expanding), we do that first so that the
                // text of the items in the navlist will be revealed by the animation.
                navigationList.setMicro(false);
            }

            // Start this layout first since it does not require a layout
            refs.senchaLogo.animate({dynamic: true, to: {width: new_width}});

            // Directly adjust the width config and then run the main wrap container layout
            // as the root layout (it and its chidren). This will cause the adjusted size to
            // be flushed to the element and animate to that new size.
            navigationList.width = new_width;
            wrapContainer.updateLayout({isRoot: true});
            navigationList.el.addCls('nav-tree-animating');

            // We need to switch to micro mode on the navlist *after* the animation (this
            // allows the "sweep" to leave the item text in place until it is no longer
            // visible.
            if (collapsing) {
                navigationList.on({
                    afterlayoutanimation: function () {
                        navigationList.setMicro(true);
                        navigationList.el.removeCls('nav-tree-animating');
                    },
                    single: true
                });
            }
        }
    },

    repaintList: function(treelist, microMode) {
        treelist.getStore().getRoot().cascadeBy(function(btn) {
            var item, toolElement;

            item = treelist.getItem(btn);

            if (item && item.isTreeListItem) {
                if (microMode) {
                    toolElement = item.getToolElement();

                    if (toolElement && toolElement.isVisible(true)) {
                        toolElement.syncRepaint();
                    }
                }
                else {
                    if (item.element.isVisible(true)) {
                        item.iconElement.syncRepaint();
                        item.expanderElement.syncRepaint();
                    }
                }
            }
        });
    },

    /*
     Funcion para cerrar la ventana activa.
     */
    onCloseWin	: function (btn, e, eOpts) {
        var me = Admin.getApplication();
            me.onCloseWin(btn, e, eOpts);
    },

    /*
     Funcion para eliminar el registro seleccionado en el grid
     @retur : String, Mensaje al usuario
     */

    onGridDelete : function (btn, e, eOpts ) {
        var me	 = Admin.getApplication();
            me.onGridDelete(btn, e, eOpts);
    },

    onDeleteView : function(cbtn){
        Ext.Msg.show({
            title: 'Elimiar datos',
            message: 'Desea eliminar el registro?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            fn: function(btn) {
                if (btn === 'yes') {
                    var grid = cbtn.up('dataview'),
                        records = [],
                        store = null;
                    if (!grid) {
                        if(cbtn.up('window')){
                            grid = cbtn.up('window').down('dataview');
                        }
                    }
                    if (!grid) {
                        if(cbtn.up('form')){
                            grid = cbtn.up('form').down('dataview');
                        }
                    }
                    if (!grid) {
                        if(cbtn.up('panel')){
                            grid = cbtn.up('panel').down('dataview');
                        }
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

    /*
     Funcion para quitar el filtro del grid
     */
    onClearFilterGrid : function (btn, e, eOpts) {
        var me 	= Admin.getApplication();
            me.onClearFilterGrid(btn, e, eOpts);
    },

    /**
     * Funcion que muestra un Iframe con el informe devuelto del servidor
     * @param xUrl - La ruta del informe
     */
    getIframe : function (xUrl, xFormat) {
		const me = this;
		Ext.require('Admin.view.docs.IframeView');
        Ext.onReady(function () {
            if (xFormat === 'pdf') {
				const cHtml = '<object><embed  width="100%" height="100%" src="' + xUrl + '"></object>';
				Ext.create('Admin.view.docs.IframeView',{
                    title 	: 'Vista previa del enlace',
                    html  	: cHtml,
                    width   : 700,
                    height  : 550,
                    maximized   : true
                }).show();
            }else{
                me.onOpenUrl(xUrl);
            }
        });
    },
    /**
     * Funcion para ver documentos dentro de la interfaz del aplicativo
     * @param xUrl (string) : La dirección URL del documento o archivo
     * @param xFormat (string)  : Formato tipo MIME del archivo o documento
     */
    onViewDocument : function (xUrl, xFormat) {
        this.getIframe(xUrl, xFormat);
    },
    /**
     * Funcion para ver un enlace en un Iframe dentro del aplicativo
     * @param xUrl
     */
    onViewUrl : function (xUrl) {
        var
            cHtml = '<object><embed  width="100%" height="100%" src="'+xUrl+'"></object>';
        Ext.create('Admin.view.docs.IframeView',{
            title 	: 'Vista previa del enlace',
            html  	: cHtml,
            width   : 700,
            height  : 550
        }).show();
		this.onOpenUrl(xUrl);
    },

    /**
     * Funcion para ver videos externos en nuestra aplicación
     * @param xUrl
     */
    onViewVideo : function (xUrl) {
        var
            retVal  = false,
            yt      = "https://www.youtube.com",
            rExp    = new RegExp(yt);
        rExp.exec(yt);
        retVal  = rExp.test(xUrl);
        if(retVal){ // Video en youtbe
            var
                newUrl= xUrl.replace('watch?v=','embed/');
                cHtml ='<iframe width="100%" height="100%" src="'+newUrl+'?&autoplay=1" cc_load_policy=1 frameborder="0" allowfullscreen></iframe>';
        }else{
            var
                cHtml  = '<object><embed  width="100%" height="100%" src="'+xUrl+'"></object>';
        }
        var win	= Ext.create('Admin.view.docs.IframeView',{
            html    : cHtml
        });
        win.show();
    },

    /**
     * Funcion para setear los datos que se enviar al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn){
        var url     = '',
            param   = {};

        this.onGenReport(btn,url,param);
    },

    /**
     * Funcion que gerena los reportes
     * @param btn
     * @param url - Url de donde se llamará el reporte
     * @param param - Parametros adiciones enviados para llamar el reporte
     */

    onGenReport: function (btn, url, param) {
        let me  	= this,
            cUrl	= Global.getApiUrl() +'/' + url,
            vMask;
        vMask = btn.up('window');
        if (Ext.isEmpty(vMask)){
            vMask   = btn.up('form');
        }

		if (Ext.isEmpty(vMask)){
            vMask   = btn.up('grid');
        }
		let xFormat = '';
        switch(btn.itemId){
            case 'btnHtml':
                xFormat = 'html';
                break;
            case 'btnRtf':
                xFormat = 'rtf';
                break;
            case 'btnXls':
                xFormat = 'xls';
                break;
            case 'btnDoc':
                xFormat = 'doc';
                break;
            case 'btnCsv':
                xFormat = 'csv';
                break;
            case 'btnPptx':
                xFormat = 'pptx';
                break;
            case 'btnPrint':
                xFormat = 'print';
                break;
            default	:
                xFormat = 'pdf';
                break;
        }
        const xParam  = param;
        Object.defineProperty(xParam,'pFormat',{
                value : xFormat,
                writable: true,
                enumerable: true,
                configurable: true
            });
        if(!Ext.isEmpty(url)) {
            if (!Ext.isEmpty(vMask)) {
                vMask.el.mask('Generando reporte...');
            }
			const {school, profile}	= AuthToken.recoverParams();
			const dt			= new Date();
			xParam.schoolId  	= school.id || 0;
			xParam.profileId   	= profile.id || 0;
			xParam.year        	= school.year || dt.getFullYear();
            Ext.Ajax.request({
                timeout : 120000000,
                url: cUrl,
                params: xParam,
				headers: {
					'Authorization' : (AuthToken) ? AuthToken.authorization() : ''
				},
                success: function (response) {
					let result = Ext.decode(response.responseText);
                    me.getIframe(result.pathFile, xFormat);
                },
                failure: function (response) {
					let result = Ext.decode(response.responseText);
                    me.app.onError(result.message || 'No se pueden cargar los datos');
                },
                callback : function (response) {
                    if (!Ext.isEmpty(vMask)) {
                        vMask.el.unmask();
                    }
                }
            });
        }
    },

    /**
     * Permite abrir un enlace en una nueva ventana
     * @param cUrl
     */
    onOpenUrl : function (cUrl) {
        var app = Admin.getApplication();
        app.onOpenUrl(cUrl);
    }
});
