/**
 * Created by LOPEZSOFT2 on 23/09/2016.
 */
Ext.define('Admin.model.inscripciones.FamiliaresModel',{
    extend  : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id'},
        { name: 'id_country'},
        { name: 'id_document'},
        { name: 'id_sex'},
        { name: 'document'},
        { name: 'expedition_plane'},
        { name: 'birth_place'},
        { name: 'lastname1'},
        { name: 'lastname2'},
        { name: 'name1'},
        { name: 'name2'},
        { name: 'blood_type'},
        { name: 'address'},
        { name: 'mobile'},
        { name: 'occupation'},
        { name: 'work_address'},
        { name: 'company'},
        { name: 'email'},
        { name: 'image'},
        { name: 'mime'},
        { name: 'active', type : 'bool'}
    ]
});
