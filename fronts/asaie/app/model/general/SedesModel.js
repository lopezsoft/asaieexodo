/**
 * Created by LOPEZSOFT on 5/12/2015.
 */
Ext.define('Admin.model.general.SedesModel',{
    extend  : 'Admin.model.base.BaseModel',
    idProperty  : 'ID',
    fields: [
        { name: 'ID'},
		{ name: 'ID_CITY'},
        { name: 'ID_INST'},
        { name: 'ID_ZONA'},
		{ name: 'ID_SEXO'},
        { name: 'FAX'},
        { name: 'COD_DANE'},
        { name: 'DANE_SEDE'},
        { name: 'CONS_SEDE'},
        { name: 'NOMBRE_SEDE'},
        { name: 'DIRECCCION_SEDE'},
        { name: 'TELEFONOS_SEDE'},
        { name: 'BARRIO'},
        { name: 'EMAIL'},
        { name: 'PRINCIPAL'}
    ]
});
