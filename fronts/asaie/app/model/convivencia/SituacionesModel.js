/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.model.convivencia.SituacionesModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id'  },
        { name : 'id_inst'},
        { name : 'numero'},
        { name : 'descripcion'},
        { name : 'id_tipo'},
        { name : 'estado'},
        { name : 'tipo'},
        { name : 'año'},
        { name : 'add_auto' , type : 'bool'}
    ]
});