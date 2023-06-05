/**
 * Created by LOPEZSOFT on 22/01/2016.
 */
Ext.define('Admin.model.docentes.RecuperacionesPeriodicasModel',{
    extend: 'Admin.model.base.BaseModel',
    fields: [
        { name: 'nombres'},
        { name: 'cod_grado'},
        { name: 'grupo'},
        { name: 'id_asig'},
        { name: 'cod_jorn'},
        { name: 'año'},
        { name: 'periodo'},
		{ name: 'fecha', type : 'date',  dateFormat: 'Y-m-d'}
    ]
});
