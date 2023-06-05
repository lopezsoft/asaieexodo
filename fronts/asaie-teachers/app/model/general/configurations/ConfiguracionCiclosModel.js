/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.ConfiguracionCiclosModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty : 'id',
    fields: [
        { name: 'semestre1'},
        { name: 'semestre2'},
        { name: 'ar_ciclos',type : 'int'},
        { name: 'ar_per_ciclos',type : 'int'},
        { name: 'per_rec_ciclos',type : 'int'},
        { name: 'nro_periodos',type : 'int'},
        { name: 'ultimo_per_define',type : 'int'}
    ]
});