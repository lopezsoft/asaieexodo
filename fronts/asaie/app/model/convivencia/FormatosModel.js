/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.model.convivencia.FormatosModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id'  },
        { name : 'id_inst'},
        { name : 'id_accion'},
        { name : 'accion'},
        { name : 'titulo'},
        { name : 'cuerpo'},
        { name : 'comprension_lectora'},
        { name : 'estado'}
    ]
});