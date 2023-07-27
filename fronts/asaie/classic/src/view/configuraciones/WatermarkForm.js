/**
 * Created by LOPEZSOFT2 on 31/03/2017.
 */
Ext.define('Admin.view.configuraciones.WatermarkForm',{
    extend  : 'Admin.base.WindowCrud',
    title   	: 'Marca de agua en reportes',
    controller  : 'configuraciones',
	alias       : 'widget.watermarkForm',
	store		: 'WatermarkStore',
	config		: {
		record	: null
	},
    items       : [
        {
            xtype   : 'customform',
            items: [
				{
					xtype       : 'FileField',
					itemId      : 'watermark_file',
					hideLabel   : true,
					allowBlank  : false,
					buttonOnly  : false,
					name        : 'watermark_file',
					buttonText  : 'Seleccionar archivo',
					listeners   : {
						change: function (tf) {
							const form = tf.up('form'),
								app = Admin.getApplication();
							const file = tf.fileInputEl.dom.files[0];
							if(!file){
								app.onError('Debe seleccionar un archivo.');
								form.reset(true);
							}else {
								let size = (parseInt(file.size) / 1024);
								if (parseInt(file.size) > 512000) {
									app.onError(`El tamaño del archivo no debe ser mayor a 512 kb. Peso del archivo actual: ${size.toFixed(3)}`);
									form.reset(true);
								}
								if(!isImage(file.name)){
									app.onError('El archivo seleccionado no es una imagen.');
									form.reset(true);
								}
							}
						}
					}
				},
				{
					xtype   : 'fieldSet',
					title   : 'Tamaño del papel:',
					items   : [
						{
							xtype   : 'customradiogroup',
							items   : [
								{
									boxLabel    : 'Carta',
									name        : 'paper_size',
									inputValue  : 'letter'
								},
								{
									boxLabel    : 'A4',
									name        : 'paper_size',
									inputValue  : 'a4'
								},
								{
									boxLabel    : 'Oficio',
									name        : 'paper_size',
									inputValue  : 'legal'
								}
							]
						}
					]
				},
				{
					xtype   : 'fieldSet',
					title   : 'Usar en:',
					items   : [
						{
							xtype   : 'customradiogroup',
							items   : [
								{
									boxLabel    : 'Certificado de promoción',
									name        : 'available_in',
									inputValue  : 1
								},
								{
									boxLabel    : 'Constancia de estudio',
									name        : 'available_in',
									inputValue  : 2
								},
								{
									boxLabel    : 'Certificado periódico de notas',
									name        : 'available_in',
									inputValue  : 3
								},
								{
									boxLabel    : 'Todos los anteriores',
									name        : 'available_in',
									inputValue  : 4
								}
							]
						}
					]
				},
				{
					xtype   : 'customcheckboxfield',
					name    : 'hide_header',
					checked : true,
					boxLabel: 'Ocultar encabezado.'
				},
				{
					xtype   : 'customcheckboxfield',
					checked : true,
					name    : 'hide_footer',
					boxLabel: 'Ocultar pie de página.'
				},
				{
					xtype       : 'fieldSet',
					defaultType : 'TextField',
					layout      : 'vbox',
					title   	: 'Márgenes',
					labelWidth  : 60,
					items       : [
						{
							fieldLabel  : 'Superior (px, mm, cm, rem)',
							name        : 'margin_top',
							width       : 400,
							value		: '3cm'
						},
						{
							fieldLabel  : 'Inferior (px, mm, cm, rem)',
							width       : 400,
							name        : 'margin_bottom',
							value		: '0cm'
						}
					]
				},
				{
					xtype   : 'customcheckboxfield',
					checked : true,
					name    : 'state',
					boxLabel: 'Activo'
				},
            ]
        }
    ],
	saveData: function (storeName, reload) {
		const me = this.getApp(),
			win = this,
			form 	= win.down('form'),
			record 	= form.getRecord(),
			values 	= form.getValues(),
			store =	 Ext.getStore(storeName);
		let url		= '';
		let method	= '';
		if (store.getModifiedRecords().length > 0) {
			win.mask('Guardando...');
		}
		Ext.define('Ext.ux.data.Html5Connection', {
			override: 'Ext.data.Connection',
			overrideAccept: true,
			isHtml5Supported: function () {
				return typeof FileReader != "undefined";
			},
			isFormUpload: function (options) {
				return !this.isHtml5Supported() && this.callParent(arguments);
			},
			setOptions: function (options, scope) {
				var opts = this.callParent(arguments);
				if (this.isHtml5Supported() && options.isUpload && options.form) {
					opts.data = new FormData(options.form);
				}
				return opts;
			},
			createRequest: function (options, requestOptions) {
				var request = this.callParent(arguments);
				if (this.isHtml5Supported() && options.isUpload && options.progress) {

					if (!options.headers) options.headers = {};
					options.headers['Content-Type'] = null;
				}

				return request;
			}
		});
		Ext.define('Ext.ux.data.Html5Request', {
			override: 'Ext.data.request.Ajax',
			openRequest: function (options, requestOptions, async, username, password) {
				var me = this;
				var xhr = this.callParent(arguments);
				if (options.isUpload && options.progress) {
					xhr.upload.onprogress = options.progress;
				}
				return xhr;
			},
			setupHeaders: function (xhr, options, data, params) {
				var acceptHeader = "Accept";
				if (this.overrideAccept && options.isUpload) {
					if (!options.headers) options.headers = {};
					options.headers[acceptHeader] = "text/html";
				}
				return this.callParent(arguments);
			}
		});
		Ext.define('Ext.ux.form.action.Action', {
			override: 'Ext.form.action.Action',
			createCallback: function () {
				var me = this;
				var callback = this.callParent();
				callback.progress = function (e) {
					var prog = e.loaded / e.total;
					Ext.callback(me.progress, me.scope || me, [me, prog, e]);
				};
				return callback;
			}
		});
		if (record) { //Edición
			url = store.getProxy().api.update + '/' + record.get('id')
			method = 'POST';
		} else { // Insertar
			url = store.getProxy().api.create;
			method = 'POST';
		}
			form.submit({
				url: url,
				method: method,
				params: {
					...Global.getSchoolParams(),
				},
				headers: Global.getHeaders(),
				waitMsg : 'Subiendo archivo...',
				success: function () {
					me.showResult('Se han guardado los datos');
					win.unmask();
					store.reload();
					win.close();
				},
				failure: function (form, action) {
					win.unmask();
					me.showResult('Error al guardar los datos');
				}
			});
	}
});
