/**
 * Created by LOPEZSOFT on 2/05/2016.
 */
Ext.define('Admin.model.general.perfil.UserModel',{
    extend      : 'Admin.model.base.BaseModel',
    fields  : [
        { name: 'id_sex'},
        { name: 'user_type'},
        { name: 'names'},
        { name: 'last_name'},
        { name: 'birth_date'},
        { name: 'username'},
        { name: 'email'},
        { name: 'lectur'},
        { name: 'message'},
        { name: 'date'},
        { name: 'image'},
        { name: 'mime'},
        { name: 'phone'},
        { name: 'state'},
        { name: 'active', type : 'bool'}
    ]
});