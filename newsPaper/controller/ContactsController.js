/**
 * Created with IntelliJ IDEA.
 * User: Administrator
 * Date: 13-12-2
 * Time: 下午4:28
 * To change this template use File | Settings | File Templates.
 */

Ext.define('NewsPaper.controller.ContactsController', {
    extend: 'Ext.app.Controller',
    views: ['ContactsBaseContainer', 'ContactsTypeContainer', 'ContactsTypeTreeView',
        'ContactsContainer', 'ContactsGridView'],
    stores: ['ContactsTypeTreeStore', 'ContactsGridStore'],
    models: ['ContactsTypeTreeModel', 'ContactsGridModel'],

    init: function () {

        this.control({
            '#addContactsType': {
                click: this.addContactsTypeClick
            },
            '#removeContactsType': {
                click: this.removeContactsTypeClick
            },
            'contactsTypeTreeView': {
                edit: this.editContactsType,
                itemclick: this.showContacts,
                itemcontextmenu: this.showTreeMenu
            },
            'contactsGridView': {
                render: this.contactsGridRender,
                edit: this.editContacts,
                itemcontextmenu: this.showGridMenu
            },
            '#addContacts': {
                click: this.addContactsClick
            },
            '#removeContacts': {
                click: this.removeContactsClick
            },
            '#importContacts': {
                click: this.importContactsClick
            },
            '#formReset': {
                click: this.formReset
            },
            '#formSubmit': {
                click: this.formSubmit
            },
            '#uploadFile': {
                click: this.uploadFile
            },
            '#startImportContacts': {
                click: this.startImportContacts
            }
        })
    },

    addContactsTypeClick: function () {
        addContactsType();
    },
    removeContactsTypeClick: function () {
        removeContactsType();
    },
    editContactsType: function (editor, e, eOpts) {
        var tree = Ext.getCmp('contactsTypeTreeView');
        var store = tree.store;
        var newValue = e.value.trim();
        var oldValue = e.originalValue.trim();
        if (newValue != oldValue) {
            var id = e.record.data.id;
            //alert('newValue = ' + newValue + ", id = " + id);
            var progress = Ext.MessageBox.wait('正在编辑通讯录类别', '编辑', {
                text: '编辑中...'
            });
            Ext.Ajax.request({
                url: '/newsPaper/contactsType/updateContactsType',
                method: 'post',
                params: {
                    id: id,
                    name: newValue
                },
                success: function (response, opts) {
                    progress.close();
                    var result = response.responseText;
                    if (result.toUpperCase() == "SUCCESS") {
                        Ext.example.msg('编辑成功', '编辑通讯录类别成功!');
                    } else {
                        Ext.MessageBox.alert('编辑失败', '编辑通讯录类别失败!');
                    }
                    treeRefresh(store, tree);
                },
                failure: function (response, opts) {
                    progress.close();
                    Ext.MessageBox.alert('编辑失败', '编辑通讯录类别失败!');
                    treeRefresh(store, tree);
                }
            });
        }

    },
    /**
     * 分页加载contacts
     * @param view
     * @param rec
     * @param item
     * @param index
     * @param e
     */
    showContacts: function (view, rec, item, index, e) {
        //alert(rec.data.id);
        var store = Ext.data.StoreManager.lookup('ContactsGridStore');
        store.loadPage(1);
    },
    /**
     * 在分页加载之前增加id参数
     * @param grid
     * @param opts
     */
    contactsGridRender: function (grid, opts) {
        var store = grid.getStore();
        store.on('beforeload', function () {
            var tree = Ext.getCmp('contactsTypeTreeView');
            var node = tree.getSelectionModel().getSelection()[0];
            if (node) {
                var id = node.data.id;
                if (id == -1) {
                    id = 0;
                }
                var idParam = {id: id};
                Ext.apply(store.proxy.extraParams, idParam);
            }
        })
    },
    addContactsClick: function () {
        var tree = Ext.getCmp('contactsTypeTreeView');
        var node = tree.getSelectionModel().getSelection()[0];
        if (node) {
            if (node.data.leaf == true) {
                Ext.create('NewsPaper.view.ContactsWindowView').show();
            } else {
                Ext.MessageBox.alert('错误', '请选择一个具体的通讯录类别!');
            }
        } else {
            Ext.MessageBox.alert('错误', '请选择一个通讯录类别!');
        }
    },
    removeContactsClick: function () {
        removeContacts();
    },
    editContacts: function (editor, context, eOpts) {
        var oldValues = context.originalValues;
        var newValues = context.newValues;
        if (oldValues.name != newValues.name
            || oldValues.idCard != newValues.idCard
            || oldValues.phone != newValues.phone
            || oldValues.email != newValues.email) {

            var progress = Ext.MessageBox.wait('正在编辑通讯录', '编辑', {
                text: '编辑中...'
            });

            var grid = Ext.getCmp('contactsGridView');
            var store = grid.getStore();
            Ext.Ajax.request({
                url: '/newsPaper/contacts/updateContacts',
                method: 'post',
                params: {
                    id: oldValues.id,
                    name: newValues.name,
                    idCard: newValues.idCard,
                    phone: newValues.phone,
                    email: newValues.email
                },
                success: function (response) {
                    progress.close();
                    var result = response.responseText;
                    if (result.toUpperCase() == "SUCCESS") {
                        Ext.example.msg('编辑成功', '编辑通讯录成功!');
                    } else {
                        Ext.MessageBox.alert('编辑失败', '编辑通讯录失败!');
                    }
                    store.reload();
                },
                failure: function (response) {
                    progress.close();
                    Ext.MessageBox.alert('编辑失败', '编辑通讯录失败!');
                }
            });
        }
    },
    formReset: function () {
        Ext.getCmp('contactsForm').getForm().reset();
    },
    formSubmit: function () {
        var window = Ext.getCmp('contactsWindowView');
        var tree = Ext.getCmp('contactsTypeTreeView');
        var node = tree.getSelectionModel().getSelection()[0];
        var id = node.data.id;
        var grid = Ext.getCmp('contactsGridView');
        var store = grid.getStore();
        var form = Ext.getCmp('contactsForm').getForm();
        if (form.isValid()) {
            var progress = Ext.MessageBox.wait('正在添加通讯录', '添加', {
                text: '添加中...'
            });
            form.submit({
                params: {
                    'contactsType.id': id
                },
                success: function (form, action) {
                    //Ext.Msg.alert('Success', action.result.msg);
                    progress.close();
                    Ext.example.msg('增加成功', '增加通讯录人员成功!');
                    window.close();
                    store.reload();
                },
                failure: function (form, action) {
                    //Ext.Msg.alert('Failed', action.result.msg);
                    progress.close();
                    Ext.MessageBox.alert('增加失败', '增加通讯录人员失败!');
                    window.close();
                    store.reload();
                }
            });
        }
    },
    showTreeMenu: function (view, record, item, index, e) {
        // 这两个很重要，否则点击鼠标右键还是会出现浏览器的选项
        e.preventDefault();
        e.stopEvent();

        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: '增加',
                    iconCls: 'Add',
                    handler: function () {
                        addContactsType();
                    }
                },
                {
                    text: '删除',
                    iconCls: 'Delete',
                    handler: function () {
                        removeContactsType();
                    }
                }
            ]
        });
        menu.showAt(e.getXY());
    },
    showGridMenu: function (view, record, item, index, e) {
        e.preventDefault();
        e.stopEvent();

        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: '删除',
                    iconCls: 'Delete',
                    handler: function () {
                        removeContacts();
                    }
                }
            ]
        });
        menu.showAt(e.getXY());
    },
    importContactsClick: function () {
        var tree = Ext.getCmp('contactsTypeTreeView');
        var node = tree.getSelectionModel().getSelection()[0];
        if (node) {
            if (node.data.leaf == true) {
                Ext.create('NewsPaper.view.ContactsImportWindowView').show();
            } else {
                Ext.MessageBox.alert('错误', '请选择一个具体的通讯录类别!');
            }
        } else {
            Ext.MessageBox.alert('错误', '请选择一个通讯录类别!');
        }
    },
    uploadFile: function () {
        // var window = Ext.getCmp('contactsImportWindowView');
        var form = Ext.getCmp('contactsImportForm').getForm();
        if (form.isValid()) {
            form.submit({
                waitMsg: '上传数据文件中...',
                success: function (form, action) {
                    //Ext.Msg.alert('Success', action.result.msg);
                    Ext.example.msg('上传成功', action.result.msg);
                    var button = Ext.getCmp('startImportContacts');
                    button.setDisabled(false);
                },
                failure: function (form, action) {
                    //Ext.Msg.alert('Failed', action.result.msg);
                    Ext.MessageBox.alert('上传失败', action.result.msg);
                }
            });
        }
    },
    startImportContacts: function () {

    }
});


function treeRefresh(store, tree) {
    store.reload();
    // 刷新tree,先全部收起,再全部展开
    tree.collapseAll(function () {
        tree.expandAll();
    });
}

/**
 * 增加通讯录类别
 */
function addContactsType() {
    var tree = Ext.getCmp('contactsTypeTreeView');
    var node = tree.getSelectionModel().getSelection()[0];
    if (node) {
        var progress = Ext.MessageBox.wait('正在添加通讯录类别', '添加', {
            text: '添加中...'
        });
        var store = tree.store;
        Ext.Ajax.request({
            url: '/newsPaper/contactsType/addChild',
            method: 'post',
            params: {
                id: node.data.id,
                text: '新添加'
            },
            success: function (response, opts) {
                progress.close();
                var result = response.responseText;
                if (result.toUpperCase() == "SUCCESS") {
                    Ext.example.msg('添加成功', '添加通讯录类别成功!');
                    treeRefresh(store, tree);
                } else if (result.toUpperCase() == "EXISTS") {
                    Ext.MessageBox.alert('添加失败', '添加通讯录类别失败!<br><br>' +
                        '错误信息 : 此通讯录类别下存在通讯录人员!');
                } else {
                    Ext.MessageBox.alert('添加失败', '添加通讯录类别失败!<br><br>' +
                        '错误信息 : 服务器端发生错误!');
                }
            },
            failure: function (response, opts) {
                progress.close();
                Ext.MessageBox.alert('添加失败', '添加通讯录类别失败!<br><br>' +
                    '错误信息 : 服务器端发生错误!');
            }
        });
    } else {
        Ext.MessageBox.alert('错误', '请选择一个节点！');
    }
}

function removeContactsType() {
    var tree = Ext.getCmp('contactsTypeTreeView');
    var node = tree.getSelectionModel().getSelection()[0];
    if (node) {
        Ext.MessageBox.confirm('确认删除', '确定删除此节点?', function (btn) {
            if (btn == 'yes') {
                if (node.data.id == -1) {
                    Ext.MessageBox.alert('错误', '不能删除根节点!');
                    return;
                }
                var progress = Ext.MessageBox.wait('正在删除通讯录类别', '删除', {
                    text: '删除中...'
                });
                var store = tree.store;
                var gridStore = Ext.getCmp('contactsGridView').getStore();

                Ext.Ajax.request({
                    url: '/newsPaper/contactsType/removeContactsType',
                    method: 'post',
                    params: {
                        id: node.data.id
                    },
                    success: function (response, opts) {
                        progress.close();
                        var result = response.responseText;
                        if (result.toUpperCase() == "SUCCESS") {
                            Ext.example.msg('删除成功', '删除通讯录类别成功!');
                        } else {
                            Ext.MessageBox.alert('删除失败', '删除通讯录类别失败!');
                        }

                        // 删除后刷新contactsType树,选中根节点,加载contacts
                        treeRefresh(store, tree);
                        tree.getSelectionModel().select(tree.getRootNode());
                        gridStore.loadPage(1);
                    },
                    failure: function (response, opts) {
                        progress.close();
                        Ext.MessageBox.alert('删除失败', '删除通讯录类别失败!');
                    }
                });
            }
        })
    } else {
        Ext.MessageBox.alert('错误', '请选择一个节点！');
    }
}

function removeContacts() {
    var grid = Ext.getCmp('contactsGridView');
    var record = grid.getSelectionModel().getSelection()[0];
    if (record) {
        Ext.MessageBox.confirm('确认删除', '确定删除此通讯录人员?', function (btn) {
            if (btn == 'yes') {
                var store = grid.getStore();
                var progress = Ext.MessageBox.wait('正在删除通讯录', '删除', {
                    text: '删除中...'
                });
                Ext.Ajax.request({
                    url: '/newsPaper/contacts/removeContacts',
                    method: 'post',
                    params: {
                        id: record.get('id')  // 或者record.data.id
                    },
                    success: function (response) {
                        progress.close();
                        var result = response.responseText;
                        if (result.toUpperCase() == "SUCCESS") {
                            Ext.example.msg('删除成功', '删除通讯录成功!');
                        } else {
                            Ext.MessageBox.alert('删除失败', '删除通讯录失败!');
                        }
                        store.reload();
                    },
                    failure: function () {
                        progress.close();
                        Ext.MessageBox.alert('删除失败', '删除通讯录失败!');
                    }
                });
            }
        });
    } else {
        Ext.MessageBox.alert('错误', '请选择一条记录！');
    }
}