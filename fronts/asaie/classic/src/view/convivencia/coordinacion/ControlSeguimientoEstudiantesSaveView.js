/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.view.convivencia.coordidacion.ControlSeguimientoEstudiantesSaveView',{
    extend : 'Admin.base.WindowCrud',
    alias   : 'widget.ControlSeguimientoEstudiantesSaveView',
    title   : 'Nuevo/Editar Control y seguimiento',
    maximized   : true,
    items   : [
        {
            xtype       : 'customform',
            defaultType : 'customtextarea',
            items   : [
                {
                    fieldLabel  : 'Compromiso del estudiante',
                    name        : 'compromiso_estudiante'
                },
                {
                    fieldLabel  : 'Compromiso del familiar o acudiente',
                    name        : 'compromiso_acudiente'
                },
                {
                    fieldLabel  : 'Compromiso del docente',
                    name        : 'compromiso_docente'
                },
                {
                    xtype       : 'DateField',
                    fieldLabel  : 'Fecha del levantamiento del acta',
                    name        : 'fecha_acta'
                },
                {
                    xtype       : 'TimeField',
                    fieldLabel  : 'Hora del levantamiento del acta',
                    name        : 'hora_acta'
                }
            ]
        }
    ]
});