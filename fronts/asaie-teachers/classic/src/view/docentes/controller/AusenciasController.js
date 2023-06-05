/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.view.docentes.controller.AusenciasController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.ausencias',

    init    : function(){
        me  = this;
        me.setConfigVar();
    },

    onLoadStudent : function (btn) {
       var  win,
            vWin    = btn.up('window');
            cGrado  = vWin.down('#cbGrado').getSelection(),
            cAsig   = vWin.down('#cbAsig').getSelection(),
            cGrupo  = vWin.down('#cbGrupo').getSelection(),
            me     = this;

        extra   = {
            pdbCodGrado : cGrado.get('cod_grado'),
            pdbGrupo    : cGrupo.get('grupo'),
            pdbIdAsig   : cAsig.get('id_asig')
        };

        me.app.setParamStore('EstudiantesStore',extra);

        win = me.app.getWindow('Estudiantes','Admin.view.docentes.EstudiantesView');
        win.show();
    },

    onImportEstudent : function (btn) {
        var win     = btn.up('window'),
            select  = win.down('grid').getSelection(),
            me      = this,
            winEst  = Ext.ComponentQuery.query('AusenciasWinView')[0];

        if (select.length === 1) {
            idMatrid    = winEst.down('#idMatric');
            nombres     = winEst.down('#nombres');

            idMatrid.setValue('');
            nombres.setValue('');

            idMatrid.setValue(select[0].get('id_matric'));
            nombres.setValue(select[0].get('nombres'));

            win.close();

        }else {
            me.app.showResult('Seleccione un estudiante por favor...');
        }
    }
});