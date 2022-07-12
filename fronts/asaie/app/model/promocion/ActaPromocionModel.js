/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.promocion.ActaPromocionModel',{
    extend  : 'Admin.model.base.BaseModel',
	idProperty  : 'id_matric',
    fields  : [
        {name : 'id_matric'},
        {name : 'promedio'      , type : 'float'},
        {name : 'promedio_rec'  , type : 'float'},
        {name : 'areas_g'       , type : 'int'},
        {name : 'areas_p'       , type : 'int'},
        {name : 'msg'},
        {name : 'msg1'},
        {name : 'msg2'},
        {name : 'msg3'},
        {name : 'estado'        , type : 'int'},
        {name : 'prom_comision' , type : 'int'}
    ]
});
