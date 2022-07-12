Ext.define('Admin.view.academico.inscripciones.forms.FamiliesForm' ,{
    extend	: 'Admin.base.SaveWindow',
    alias 	: 'widget.familiesform',
	controller	: 'academico',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleNewEdit()+' '+AppLang.getSTitleViewFamilies());
	},
	store			: 'FamiliesStore',
	defaultFocus	: 'CbCountries',
    items : [
    	{
			xtype		: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'DATOS DE IDENTIFICACIÓN',
					items 	: [
						{
							xtype       : 'CbCountries'
						},
						{
							fieldLabel  : 'Número del documento',
							name        : 'document',
							listeners	: {
								focusleave : function (me, event, eOpts) {
									var
										form	= me.up('window').down('form'),
										values	= form.getValues(),
										app		= Admin.getApplication(),
										record	= form.getRecord();
									if (!record){
										if (me.getValue().length > 0){
											socket		= Global.getSocket();
											param		= {
												dataName	: Global.getDbName(),
												table		: 'families',
												where		: ['document = ?'],
												values		: [me.getValue()],
												fields		: '*'
											};
											socket.emit('querySelect',(param),(err, res)=>{
												if (err) {
													app.showResult('Error en el servidor','error');
													return	
												}
												values	= res[0];
												if (values){
													form.getForm().setValues(values);
													app.showResult('Ya existe un familiar para el documento: '+me.getValue().toString(),'error');
												}
											});
										}
									}
								}
							}
						},
						{
							xtype       : 'CbDocumentos',
							name		: 'id_document'
						},
						{
							xtype       : 'CbCiudades',
							fieldLabel  : 'Lugar de expedición',
							name		: 'expedition_plane'
						},
						{
							fieldLabel  : 'Primer apellido',
							name        : 'lastname1'
						},
						{
							fieldLabel  : 'Segundo apellido',
							name        : 'lastname2',
							allowBlank 	: true
						},
						{
							fieldLabel  : 'Primer nombre',
							name        : 'name1'
						},
						{
							fieldLabel  : 'Segundo nombre',
							name        : 'name2',
							allowBlank 	: true
						},
						{
							xtype		: 'CbPoblacionAtendida',
							fieldLabel	: 'Sexo',
							name		: 'id_sex'
						},
						{
							xtype	: 'CbRH',
							name	: 'blood_type'
						}
					]
				},
				{
					title	: 'INFORMACIÓN DE RESIDENCIA',
					items 	: [
						{
							fieldLabel	: 'Dirección residencial',
							name		: 'address'
						},
						{
							fieldLabel	: 'Teléfono celular',
							name		: 'mobile',
							allowBlank 	: true
						},
						{
							xtype       : 'CbCiudades',
							fieldLabel  : 'Lugar de residencia',
							store		: 'CitiesStore2',
							name		: 'birth_place'
						}
					]
				},
				{
					title	: 'DATOS LABORALES',
					items 	: [
						{
							fieldLabel	: 'Empresa donde labora',
							name		: 'company',
							allowBlank	: true
						},
						{
							fieldLabel	: 'Ocupación o cargo',
							name		: 'occupation',
							allowBlank	: true
						},
						{
							fieldLabel	: 'Dirección laboral',
							name		: 'work_address',
							allowBlank	: true
						},
						{
							fieldLabel	: 'Correo electrónico',
							name		: 'email',
							allowBlank	: true
						}
					]
				}

			]
		}		    
	]
});
