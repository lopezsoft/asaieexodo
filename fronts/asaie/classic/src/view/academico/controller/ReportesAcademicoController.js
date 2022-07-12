/**
 * Created by LOPEZSOFT on 21/05/2016.
 */
Ext.define('Admin.view.academico.controller.ReportesAcademicoController',{
    extend  : 'Admin.base.BaseController',
    alias   : 'controller.ReportesAcademico',

    init: function() {
        me  = this;
        me.setConfigVar();
        me.control({});
    },

    onCarne : function (btn) {
        Ext.create('Admin.view.general.GenerarCarnets').show();
    },

    onEstSinNotas : function (btn) {
        var
            me  = this,
            ts  = btn.up('window') || btn.up('form'),
            xUrl = Global.getUrlBase() + 'excel_manager/consolidado_sin_notas';
        ts.mask(AppLang.getSGenerating());
        try {
            Ext.Ajax.request({
                url: xUrl,
                timeout: 0,
                success: function (response, opts) {
                    var obj = Ext.decode(response.responseText);
                    ts.unmask();
                    me.onOpenUrl(obj.pathFile);
                },
                failure: function (response, opts) {
                    ts.unmask();
                    me.app.onError('Error en el servidor status code ' + response.status);
                }
            });
        } catch (E) { 
            console.log(E);
            ts.unmask();
        }
    },

    onConsolidadoMatricula : function (btn) {
        var
            me      = this,
            ts      = btn.up('window') || btn.up('form'),
            xUrl    = Global.getUrlBase()+'excel_manager/consolidado_matricula';
        try {
            ts.mask(AppLang.getSGenerating());
            Ext.Ajax.request({
                url: xUrl,
                timeout: 0,
                success: function (response, opts) {
                    ts.unmask();
                    var obj = Ext.decode(response.responseText);
                    me.onOpenUrl(obj.pathFile);
                },
                failure: function (response, opts) {
                    ts.unmask();
                    me.app.onError('Error en el servidor status code ' + response.status);
                }
            });
        } catch (E) {
            ts.unmask();
            console.log(e);
        }
    },

    /**
     * Funcion para setear los datos que se enviar al servidor para lamar el reporte.
     * @param btn
     */
    onSetReport: function(btn){
        var
            win     = btn.up('window'),
            name    = win.getItemId(),
            form    = null,
            param   = {};
        switch (name){
            case  'FamiliaresRepView'  :
                var
                    url     = 'reports/report_familiares',
                    param   = {
                        pdbGrado    : win.down('#comboGrados').getValue() || 0,
                        pdbJorn     : win.down('#comboJornadas').getValue() || 0,
                        pdbType     : win.down('#CbTipoFamiliar').getValue() || 0,
                        pdbSede     : win.down('#comboSedes').getValue() || 0,
                        pdbAll      : win.down('#Ck').getValue() ? 1 : 0
                    };
                break;
            case  'FechaNacView'  :
                var
                    url     = 'reports/report_fechas_nac',
                    param   = {
                        pdbGrado    : win.down('#comboGrados').getValue(),
                        pdbJorn     : win.down('#comboJornadas').getValue(),
                        pdbGrupo    : win.down('#comboGrupo').getValue(),
                        pdbSede     : win.down('#comboSedes').getValue(),
                        pdbType     : win.down('#Ck').getValue() ? 1 : 0
                    };
                break;
            case  'ListaDocentesView'  :
                var
                    url     = 'reports/report_listas_docentes',
                    grid    = win.down('grid'),
                    param   = {};
                break;
            case  'AsignacionAcadView'  :
                var
                    url     = 'reports/report_listas_asignacion_acad',
                    grid    = win.down('grid'),
                    param   = {
                        pdbGrado    : win.down('#comboGrados').getValue(),
                        pdbSede     : win.down('#comboSedes').getValue(),
                        pdbDocente  : win.down('#Ck').getValue() ? grid.getSelection()[0].get('id_docente') : 0
                    };
                break;
            case  'CtrlNotasCargaView'  :
                var
                    url     = 'reports/report_listas_con_carga',
                    values  = win.down('grid').getSelection()[0],
                    param   = {
                        pdbDocente  : values.get('id_docente'),
                        pdbPeriodo  : win.down('#periodo').getValue(),
                        pdbType     : win.typeReport > 0 ? win.typeReport : 1
                    };
                break;
            case  'CtrlNotasView'  :
                var
                    url     = 'reports/report_listas_sin_carga',
                    param   = {
                        pdbGrado    : win.down('#comboGrados').getValue(),
                        pdbJorn     : win.down('#comboJornadas').getValue(),
                        pdbGrupo    : win.down('#comboGrupo').getValue(),
                        pdbSede     : win.down('#comboSedes').getValue(),
                        pdbPeriodo  : win.down('#periodo').getValue(),
                        pdbType     : win.typeReport > 0 ? win.typeReport : 1
                    };
                break;
            case  'FichaMatriculaView'  :
                var
                    url     = 'reports/report_ficha_matricula',
                    param   = {
                        pdbGrado    : win.down('#comboGrados').getValue(),
                        pdbJorn     : win.down('#comboJornadas').getValue(),
                        pdbGrupo    : win.down('#cbGrupos').getValue(),
                        pdbSede     : win.down('#comboSedes').getValue(),
                        pdbCodEst   : 0,
                        pdbType     : 2
                    };
                break;
            case  'EstadisticaEdadesView'  :
                var
                    url     = 'reports/report_estadistica_edades';
                break;
            case  'MatriculadosView'  :
                var
                    url     = 'reports/report_matriculados',
                    param   = {
                        pdbGrado    : win.down('#comboGrados').getValue(),
                        pdbJorn     : win.down('#comboJornadas').getValue(),
                        pdbGrupo    : win.down('#cbGrupos').getValue(),
                        pdbSede     : win.down('#comboSedes').getValue(),
                        pdbType     : win.down('#ckAcud').getValue() ? 1 : 0
                    };
                break;
            case  'DesplazadosView'  :
                var
                    url     = 'reports/report_desplazados';
                break;
            case  'EstudiantesJornadasView'  :
                var
                    url     = 'reports/report_estudiantes_jorn';
                break;
            default :
                var
                    url     = 'reports/report_consolidado',
                    values  = win.down('form').getValues(),
                    param   = {
                        pdbCodGrado : values.id_grado,
                        pdbIdJorn   : values.cod_jorn,
                        pdbGrupo    : values.grupo,
                        pHojaReport : values.hoja,
                        pTypeReport : values.id_report,
                        pdbIdSede   : values.id_sede,
                        pdbPeriodo  : values.periodo,
                        pdbAllPer   : values.allper
                    };
                break;
        }
        this.onGenReport(btn,url,param);
    },

    onViewReportes : function (btn) {
        Ext.create('Admin.view.academico.reportes.ReportesView').show();
    }

});
