Ext.define('Admin.view.representative.DegreesPerTableView',{
    extend  	: 'Admin.base.SaveWindow',
    title   	: 'Grado asignado a la mesa',
    alias   	: 'widget.degreespertableview',
    controller  : 'representative',
    maxHeight  	: 200,
	store   	: 'DegreesPerTableStore',
	reloadStore	: true,
    items   : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype   : 'CbGrados',
					name	: 'grade_id'
                },
                {
                    xtype   	: 'CbGrupo',
					name		: 'group_name',
					allowBlank	: true
                }
            ]
        }
    ],
	saveData	: function(storeName,reload){
		const me = Admin.getApplication(),
			ts = this,
			form = ts.down('form'),
			record = form.getRecord(),
			values = form.getValues(),
			records = ts.getRecords(),
			store = Ext.getStore(storeName);

		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				ts.mask('Guardando...');
			}
			record.set(values);
			store.sync({
				success : function(batch, o) {
					me.showResult('Se han guardado los datos');
					ts.unmask();
					if (reload === true){
						store.reload();
					}
					ts.close();
				},
				failure	: function (re) {
					ts.unmask();
					store.rejectChanges();
				}
			});
		}else{ // Insertar
			if(records) {
				values.polling_station_id	= records.get('id');
			}
			ts.mask('Guardando...');
			store.insert(0,values);
			store.sync({
				success : function(batch, o){
					me.showResult('Se han guardado los datos');
					ts.unmask();
					ts.close();
					if (reload === true){
						store.reload();
					}
				},
				failure	: function (re) {
					store.rejectChanges();
					ts.unmask();
				}
			});
		}
	},
});
