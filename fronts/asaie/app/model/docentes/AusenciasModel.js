/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.model.docentes.AusenciasModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'nombres'},
        { name: 'cod_grado'},
        { name: 'motivo'},
        { name: 'adjunto'},
        { name: 'mime'},
        { name: 'observacion'},
        { name: 'horas'},
        { name: 'sede'},
        { name: 'grupo'},
        { name: 'cod_asig'},
        { name: 'año'},
        { name: 'tipo'},
        { name: 'fecha_falta'},
        { name: 'fecha_alta'}
    ]
});