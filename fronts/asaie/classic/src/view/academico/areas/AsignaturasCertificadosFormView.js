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
			  form 		= win.down('form'),
			  record	= form.getRecord(),
			  values	= form.getValues();
		  let store		= Ext.getStore(storeName);
		   if(record) { // edit
			  this.saveData(store, true);
		   }else {
			  let subjectData    		= this.getRecord();
			  values.subject_parent_id 	= subjectData.id_pk;
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
							xtype		: 'CbAsignaturasType',
						},
                        {
                            xtype       : 'customnumberfield',
                            fieldLabel  : 'I/H',
                            name		: 'ih'
                        },
						{
							xtype		: 'yearField',
							name		: 'year'
						},
                        {
                            xtype		: 'customradiogroup',
                            columns		: 1,
                            vertical	: true,
                            fieldLabel	: 'Estado',
                            items		: [
                                {
                                    boxLabel	: 'Activa',
                                    name		: 'state',
                                    inputValue	: 1
                                },
                                {
                                    boxLabel	: 'Inactiva',
                                    name		: 'state',
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
