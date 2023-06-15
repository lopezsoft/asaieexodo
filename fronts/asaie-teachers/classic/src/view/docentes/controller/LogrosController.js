/**
 * Created by LOPEZSOFT on 19/12/2015.
 */
Ext.define('Admin.view.docentes.controller.LogrosController', {
    extend: 'Admin.base.BaseController',
    alias: 'controller.logros',
    init: function() {
        this.setConfigVar();
    },

    /**
     * Funcion que realiza la importación de los logros en indicadores del parcelador de clases
     * @param btn
     */
    onClickImportYear : function (btn) {
        var
			win     = btn.up('window'),
            select  = win.down('grid').getSelection(),
            me      = Admin.getApplication(),
            store 	= Ext.getStore('LogrosStore');
        if (select.length > 0) {
            win.mask(AppLang.getSSavingChanges());
            Ext.each(select,function (rec) {
				var data = {
					descripcion			: rec.get('descripcion'),
					estado				: rec.get('estado'),
					id_escala			: rec.get('id_escala'),
					periodo 			: rec.get('periodo'),
                    id_competencia      : rec.get('id_competencia'),
                    asignacion          : rec.get('asignacion'),
					tipo                : rec.get('tipo')
				};
				store.insert(0,data);
			});
            store.sync({
				callback	: function () {
                    win.unmask();
                    win.close();
                    store.reload();
				}
			});
        }else{
            me.app.showResult('No a seleccionado datos para importar.');
        }
    },

	/**
     * Funcion que crea la vista para realizar la importación de los logros e indicadores del parcelador.
     * @param btn
     */
    onViewImport : function (btn) {
        var me      = this,
            type    = btn.up('window').ntype,
            record  = Ext.ComponentQuery.query('CargaAgrupadaView')[0] ? Ext.ComponentQuery.query('CargaAgrupadaView')[0].getSelection()[0] :
                      Ext.ComponentQuery.query('NotasView')[0].down('#CbCarga').getSelection(),
            xStore      = Ext.getStore('LanguageStore');
        me.app.onStore('general.DesempenosStore');
        me.app.onStore('general.PeriodosStore');
        me.app.onStore('docentes.ImportarLogrosIndStore');
        extra = {
            pdbTable    : 'parcelador_cli',
            pdbCodGrado : record.get('id_grado'),
            pdbIdAsig   : record.get('id_asig'),
            pdbIdSede   : record.get('id_sede')
        };
        me.app.setParamStore('ImportarLogrosIndStore',extra);
        win = me.app.getWindow('Importar','Admin.view.docentes.ImportarLogrosIndView');
        win.show();
    },

    onViewImportYear : function (btn) {
		const record = btn.up('window').getRecord();
		let extra = {
			pdbGrado: record.get('id_grado'),
			pdbAsig: record.get('id_asig'),
			pdbSede: record.get('id_sede')
		};
        Admin.getApplication().setParamStore('ImportarDescriptoresStore',extra);
        Ext.create('Admin.view.docentes.ImportarDescriptores',{
            record  : record,
            title   : 'Importar Descriptores: ' + record.get('asignatura') + ' - ' + record.get('grado')
        }).show();
    },

    onViewImportBanco : function (btn) {

    }
});
