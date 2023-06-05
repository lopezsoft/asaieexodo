/**
 * Created by LOPEZSOFT2 on 14/08/2016.
 */
Ext.define('Admin.model.convivencia.SituacionesTipoModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name : 'id'  },
        { name : 'id_inst'},
        { name : 'descripcion'},
        { name : 'estado', type : 'bool'}
    ]
});