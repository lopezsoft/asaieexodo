/**
 * Created by LOPEZSOFT on 11/01/2016.
 */
Ext.define('Admin.model.docentes.LogrosEstandarModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id_logro_estandar'},
        { name : 'id_nota'},
        { name : 'final'},
        { name : 'nombre_escala'},
        { name : 'id_escala'},
        { name  : 'estado'}
    ]
});
