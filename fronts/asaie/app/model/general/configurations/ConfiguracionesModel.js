/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.ConfiguracionesModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty : 'id',
    fields: [
        { name: 'id_grupo_grados',type : 'int'},
        { name: 't_año_lectivo',type : 'int'},
        { name: 'areas_pierde',type : 'int'},
        { name: 'pierde_luego_rec',type : 'int'},
        { name: 'active_fecha_rec',type : 'int'},
        { name: 'Ndecimales',type : 'int'},
        { name: 'nota_max_rec',type : 'float'},
        { name: 'grupo',type : 'int'},
        { name: 'procesos',type : 'int'},
        { name: 'prom_areas',type : 'float'},
        { name: 'porcentaje_areas',type : 'int'},
        { name: 'docente_ficha_obs',type : 'int'},
        { name: 'porciento_ausencia',type : 'float'},
        { name: 'pierde_año_lectivo_area',type : 'int'},
        { name: 'a_estra_apoyo_fecha',type : 'int'},
        { name: 'resuelve_sit_acade',type : 'int'},
        { name: 'cant_est_x_libro',type : 'int'},
        { name: 'nombre_grado_agrupado'},
        { name: 'conv_reincidencia',type : 'int'},
        { name: 'notas_num_prees',type : 'int'},
        { name: 'prom_area_puesto',type : 'int'},
        { name: 'nota_final_redondeo',type : 'float'},
        { name: 'nota_redondeo',type : 'float'},
        { name: 'aplicar_redondeo_fin_año', type : 'int'}
    ]
});
