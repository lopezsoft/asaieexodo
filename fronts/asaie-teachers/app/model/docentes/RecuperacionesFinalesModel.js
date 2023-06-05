/**
 * Created by LOPEZSOFT on 25/01/2016.
 */
Ext.define('Admin.model.docentes.RecuperacionesFinalesModel',{
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'estudiante'},
        { name: 'cod_grado'},
        { name: 'sede'},
        { name: 'grupo'},
        { name: 'cod_asig'},
        { name: 'cod_jorn'},
        { name: 'año'},
        { name: 'cod_area'},
        { name: 'notafinal'},
        { name: 'notarecuperada'},
        { name: 'abrev'},
        { name: 'area'},
        { name: 'estado', type : 'bool'},
		{ name: 'fecha', type : 'date',  dateFormat: 'Y-m-d'}
    ]
});
