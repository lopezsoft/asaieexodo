/**
 * Created by LOPEZSOFT on 31/12/2015.
 */

function addField(btn) {
	const db = Global.getScale(),
		form = btn.up('window').down('form'),
		cbValue = form.down('cbtipoprocesos').getValue();
	Ext.each(db,function (rec) {
		let comp;
		let txt2;
		if (rec.id > 0) {
			comp = Ext.create('Admin.container.ContainerDescriptoresEscala', {
				itemId: 'op' + rec.id_escala
			});
			txt2 = comp.down('textarea');
			txt2.setValue(rec.mensaje);
			txt2.setFieldLabel(rec.nombre_escala);

			txt2 = comp.down('hiddenfield');
			txt2.setValue(rec.id_escala);
			comp.down('cbtipoprocesos').setValue(cbValue);
			form.add(comp);
			form.setScrollY(form.height / 2, true);
			form.down('#indicador').focus();
		}
	});
	setTextFields(btn);
}

function outField(btn) {
	const db = Global.getScale(),
		form = btn.up('window').down('form');
	Ext.each(db,function (rec) {
		let comp;
		if (rec.id > 0) {
			comp = Ext.create('Admin.container.ContainerDescriptoresEscala', {
				itemId: 'op' + rec.id_escala
			});
			form.remove(comp);
			form.setScrollY(form.height / 2, true);
		}
	});
}

function  setTextFields(btn) {
	const db = Global.getScale(),
		form = btn.up('window').down('form'),
		value = form.down('#indicador').getValue();
	Ext.each(db,function (rec) {
		let comp;
		let txt2;
		if (rec.id > 0) {
			comp = 'op' + rec.id_escala;
			comp = form.down('#' + comp);
			txt2 = comp.down('textarea');
			txt2.setValue(rec.mensaje + value);
			form.down('#indicador').focus();
		}
	});
}

function setType(btn, value) {
	const db = Global.getScale(),
		form = btn.up('window').down('form');
	Ext.each(db,function (rec) {
		let txt2;
		let comp;
		if (rec.id > 0) {
			comp = 'op' + rec.id_escala;
			comp = form.down('#' + comp);
			if (comp) {
				txt2 = comp.down('cbtipoprocesos');
				txt2.setValue(value);
			}
		}
	});
}

Ext.define('Admin.view.docentes.DescriptoresSave',{
    extend		: 'Admin.base.WindowCrud',
    alias 		: 'widget.descriptoressave',
    xtype 		: 'descriptoressave',
    controller  : 'logros',
	defaultFocus: 'textareafield',
	store		: 'LogrosStore',
    items : [
        {
            xtype 			: 'customform',
            fieldDefaults: {
                labelAlign	: 'top',
                labelStyle	: 'font-weight:bold'
            },
            defaultType 	: 'textareafield',
            defaultFocus    : 'textareafield',
            items : [
                {
                	xtype		: 'container',
					defaultFocus: 'textareafield',
					layout: {
						type: 'hbox'
					},
					items	: [
						{
							xtype		: 'textareafield',
							name      	: 'descripcion',
							fieldLabel	: 'Descripción',
							itemId		: 'indicador',
							allowBlank	: false,
							minHeight	: 30,
							flex		: 1,
							margin		: '0 1 1 1',
							readOnly	: !Global.isEnabledYear(),
							listeners	: {
								change : function (txtA, newValue, oldValue, eOpts ) {
									const win = txtA.up('window'),
										cValue = win.down('#estado').getValue(),
										form = win.down('form');
									if (!form.getRecord()) { // Si se está realizando una nueva inserción de datos.
										if (parseInt(cValue.estado) === 1) {
											setTextFields(txtA);
										}
									}
								}
							}
						},
						{
							xtype		: 'cbtipoprocesos',
							height		: '100%',
							disabled	: !Global.isEnabledYear(),
							listeners	: {
								change	: function(cb, nv, ov){
									if(nv !== ov){
										setType(cb,nv);
									}
								}
							},
							value		: 0
						}
					]
                },
				{
					xtype		: 'customradiogroup',
					itemId		: 'estado',
					fieldLabel	: 'Estado',
					disabled	: !Global.isEnabledYear(),
					defaults	: {
						name	  	: 'estado'
					},
					items: [
						{
							boxLabel	: 'Asignar a los estudiantes, según desempeño',
							inputValue	: '1'
						},
						{
							boxLabel	: 'Asignar a los estudiantes, sin tener en cuenta el desempeño',
							inputValue	: '2'
						},
						{
							boxLabel	: 'No asignar automáticamente a los estudiantes',
							inputValue	: '3'
						}
					],
					listeners : {
						change : function (radiogroup, newValue) {
							const win = radiogroup.up('window'),
								form = win.down('form');
							if (!form.getRecord()) { // Si se está realizando una nueva inserción de datos.
								if (parseInt(newValue.estado) === 1){
									addField(radiogroup);
								}else{
									outField(radiogroup);
								}
							}
						}
					}
				},
                {
                    xtype 		: 'CbEscalaNacional',
					disabled	: !Global.isEnabledYear(),
                    hidden		: true,
                    autoLoadOnValue: true,
					allowBlank	: true
                },
                {
                    xtype 		: 'CbPeriodos',
					disabled	: !Global.isEnabledYear(),
                },
                {
                    xtype       : 'customComboBox',
					disabled	: !Global.isEnabledYear(),
					pageSize    : 0,
                    fieldLabel  : 'Competencia',
                    store       : 'CompetenciasDocentesStore',
                    name		: 'id_competencia',
                    displayField: 'competencia',
                    valueField	: 'id',
                    itemId		: 'comboCompetencias'
                }
            ]
        }
	],
	saveData: function (storeName, reload) {
		let win = this,
			form 		= win.down('form'),
			values 		= form.getValues(),
			record 		= form.getRecord(),
			me 			= Admin.getApplication(),
			store 		= Ext.getStore('LogrosStore'),
			extra 		= me.getParamStore('LogrosStore');

		extra.pdbPeriodo	= values.periodo;
		me.setParamStore('LogrosStore',extra,false);
        if (record) { //Edición
            record.set(values);
            store.sync({
				callback	: function(){
					win.close();
					delete extra.pdbPeriodo;
					me.setParamStore('LogrosStore', extra, false);
				}
			});
		}else{ // Insertar
			win.mask();
            if (parseInt(values.estado) === 1){ // El usuario eligió por desempeños
                Ext.each(values.descriptor,function (rec,index) {
					const data = {
						descripcion		: rec,
						estado			: values.estado,
						id_escala		: values.id[index],
						periodo			: values.periodo,
						id_competencia	: values.id_competencia,
						tipo			: values.tipo_des[index]
					};
					store.insert(0,data);
				});
				store.sync({
					callback	: function () {
						extra   = me.getParamStore('LogrosStore');
						delete extra.pdbPeriodo;
						me.setParamStore('LogrosStore',extra,true);
						win.unmask();
						win.close();
					}
				});
            }else{
				const data = {
					descripcion		: values.descripcion,
					estado			: values.estado,
					id_escala		: '0',
					periodo			: values.periodo,
					id_competencia	: values.id_competencia,
					tipo			: values.tipo
				};
				store.insert(0,data);
                store.sync({
					callback	: function () {
						extra   = me.getParamStore('LogrosStore');
						delete extra.pdbPeriodo;
						me.setParamStore('LogrosStore',extra,true);
						win.unmask();
						win.close();
					}
				});
            }
        }
    }
});
