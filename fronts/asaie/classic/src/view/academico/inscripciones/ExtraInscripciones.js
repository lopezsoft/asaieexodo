Ext.define('Admin.view.academico.inscripciones.ExtraInscripciones',{
    extend		: 'Admin.base.WindowCrud',
    alias 		: 'widget.extrainscripciones',
	maxWidth	: 750,
	controller	: 'academico',
	initComponent: function () {
		this.callParent(arguments);
		this.setTitle(AppLang.getSTitleNewEdit() + ' ' + AppLang.getSTitleViewStudents());
	},
	saveData	: function(storeName,reload){
		var me 		= this.getApp(),
			win		= this,
			form    = win.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			datastud= win.getRecord(),
			store   = Ext.getStore(storeName);
		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				win.mask('Guardando...');
			}
			record.set(values);
			store.sync({
				success : function(batch, o) {
					me.showResult('Se han guardado los datos');
					win.unmask();
					if (reload == true){
						store.reload();
					}
					win.close();
				},
				failure	: function (re) {
					win.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
			win.mask('Guardando...');
			values.id_inscripcion = datastud.get('id');
			store.insert(0,values);
			store.sync({
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					win.unmask();
					win.close();
				},
				failure	: function (re) {
					store.rejectChanges();
					win.unmask();
				}
			});
		};
	},
	store	: 'ExtraInscripcionesStore',
    items 	: [
    	{
			xtype		: 'customform',
			defaultType	: 'fieldSet',
			items	: [
				{
					title	: 'INFORMACIÓN SOCIO-ECONÓMICA',
					items 	: [
						{
							xtype	: 'CbSisben',
							name	: 'sisben'
						},
						{
							fieldLabel 	: 'Número del carné',
							name		: 'nro_sisben',
							allowBlank 	: true
						},
						{
							fieldLabel	: 'Puntaje',
							name		: 'puntaje_sisben',
							allowBlank 	: true
						},
						{
							xtype		: 'fieldcontainer',
							fieldLabel	: 'Benericiario',
							defaultType	: 'customcheckboxfield',
							items: [
								{
									boxLabel  : 'Alumno Madre cabeza de familia',
									name      : 'cab_familia',
									id        : 'checkbox1'
								},
								{
									boxLabel  : 'Beneficiario Hijos dependientesde de Madre cabeza de familia',
									name      : 'ben_mad_flia',
									inputValue: '1',
									id        : 'checkbox2'
								},
								{
									boxLabel  : 'Beneficiario Veteranos de la fuerza pública',
									name      : 'ben_vet_fp',
									id        : 'checkbox3'
								},
								{
									boxLabel  : 'Beneficiario Héroes de la Nación',
									name      : 'ben_her_nan',
									id        : 'checkbox4'
								}
							]
						},
						{
							xtype	: 'CbEps',
							name	: 'id_eps'
						}
					]
				},
				{
					title	: 'INFORMACIÓN COMPLEMENTARIA',
					items 	: [
						{
							xtype	: 'CbPoblacionVictimaCon',
							name	: 'id_pob_vic_conf'
						},
						{
							xtype		: 'CbDesicion',
							name		: 'proviene_sector_priv',
							fieldLabel	: 'Proviene del sector privado?'
						},
						{
							xtype		: 'CbDesicion',
							name		: 'proviene_otro_mun',
							fieldLabel	: 'Proviene de otro Municipio?'
						},
						{
							xtype		: 'CbTipoDiscapacidad',
							name		: 'id_discapacidad'
						},
						{
							xtype		: 'CbCapacidadesExcepcionales',
							name		: 'id_cap_exc'
						},
						{
							xtype		: 'CbEtnias',
							name		: 'id_etnia'
						},
						{
							xtype		: 'CbResguardos',
							name		: 'id_resgua'
						},
						{
							fieldLabel	: 'Código de familias en acción',
							name		: 'cod_flia_accion',
							allowBlank 	: true
						}
					]
				}
			]
		}		    
	]
});
