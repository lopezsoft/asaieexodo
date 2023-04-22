Ext.define('Admin.view.academico.AsignaturasCertificadosFormView' ,{
    extend	: 'Admin.base.WindowCrud',
    alias 	: 'widget.AsignaturasCertificadosFormView',
	maximized	: false,
	controller	: 'academico',
    maxHeight: 470,
    closeAction: 'hide',
    initComponent: function () {
        this.callParent(arguments);
        this.setTitle(AppLang.getSTitleViewSubjects());
    },
	onSave: function () {
		const storeName = this.getStore();
		if (storeName) {
		   const me = this.getApp(),
			  win = this,
			  form = win.down('form'),
			  record = form.getRecord(),
			  values = form.getValues();
		   if(record) { // edit
			  this.saveData(store, me.getReloadStore());
		   }else {
			  let subjectData    = this.getRecord();
			  let store     = Ext.getStore(storeName);
			  values.id_asig_padre = subjectData.id_pk;
			  win.mask('Guardando...');
			  store.insert(0,values);
			  store.sync({
				 success : function(){
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
					store.reload();
				 },
				 failure    : function () {
					store.rejectChanges();
					win.unmask();
				 }
			  });
		   }
		}
	},
    store: 'AsignaturaCertificadoStore',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'DATOS DE LA ASIGNATURA',
					items 	: [
						{
                            fieldLabel  : 'Nombre de la asignatura',
                            name        : 'nombre'
						},
                        {
                            fieldLabel  : 'Abreviatura',
							name		: 'abrev'
                        },
                        {
                            xtype       : 'customnumberfield',
                            fieldLabel  : 'I/H',
                            name		: 'ih'
                        },
                        {
                            xtype		: 'customradiogroup',
                            columns		: 1,
                            vertical	: true,
                            fieldLabel	: 'Estado',
                            items		: [
                                {
                                    boxLabel	: 'Activa',
                                    name		: 'estado',
                                    inputValue	: 1
                                },
                                {
                                    boxLabel	: 'Inactiva',
                                    name		: 'estado',
                                    inputValue	: 0
                                }
                            ]
                        }
					]
				}
			]
		}
	]
});
