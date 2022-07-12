/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.model.docentes.ActividadesClaseModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id_docente'},
        { name: 'id_asig'},
        { name: 'motivo'},
        { name: 'adjunto'},
        { name: 'id_jorn'},
        { name: 'id_sede'},
        { name: 'id_grado'},
        { name: 'grupo'},
        { name: 'actividad'},
        { name: 'fecha'},
        { name: 'año'}
    ]
});
