Ext.define('Admin.view.representative.TableHeadquartersView',{
    extend  	: 'Admin.base.CustomWindow',
    title   	: 'Sedes asignadas a la mesa',
    alias   	: 'widget.tableheadquartersview',
    controller  : 'representative',
    maxHeight  	: 170,
	store   	: 'TableHeadquartersStore',
	reloadStore	: true,
    items   : [
        {
            xtype   : 'customform',
            items   : [
                {
                    xtype   : 'CbSedes',
					name	: 'headquarter_id'
                },
            ]
        }
    ],
	saveData	: function(storeName,reload){
		var me 		= Admin.getApplication(),
			ts		= this,
			form    = ts.down('form'),
			record  = form.getRecord(),
			values  = form.getValues(),
			records	= ts.getRecords(),
			store   = Ext.getStore(storeName);

		if (record) { //Edición
			if (store.getModifiedRecords().length > 0) {
				ts.mask('Guardando...');
			}
			record.set(values);
			store.sync({
				success : function(batch, o) {
					me.showResult('Se han guardado los datos');
					ts.unmask();
					if (reload == true){
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
					if (reload == true){
						store.reload();
					}
				},
				failure	: function (re) {
					store.rejectChanges();
					ts.unmask();
				}
			});
		};
	},
});
