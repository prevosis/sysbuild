/*global Buffer, saveAs:false*/
import ko from 'knockout';
import templateMarkup from 'text!./file-browser.html';
import 'knockout-projections';
import GithubInt from 'app/github-int/github-int';
import SysRuntime from 'app/sys-runtime';
import SysFileSystem from 'app/sys-filesystem';
import bootbox from 'bootbox';
import 'bootstrap-contextmenu';
import 'Blob';
import 'FileSaver';
import * as SysGlobalObservables from 'app/sys-global-observables';
import JSZip from 'jszip';

// notification options
var warningNotific8Options = {
    life: 5000,
    theme: 'ruby',
    icon: 'exclamation-triangle'
};

var busyNotific8Options = {
    life: 5000,
    theme: 'lemon',
    icon: 'info-circled'
};

var confirmNotific8Options = {
    life: 5000,
    theme: 'lime',
    icon: 'check-mark-2'
};

class Filebrowser {
    constructor() {
        var readyCallback = () => {
            this.id = '#file-browser-body';
            var fs = this.fs = SysFileSystem;

            this.editor = SysGlobalObservables.Editor;
			      SysGlobalObservables.FileBrowser = this;
            SysGlobalObservables.ObservableFS(this);

            this.depth = -1;
            this.directoryState = [];
            this.activePath = '';

            // refresh the file browser on file system changes
            fs.addChangeListener(() => {
                try {
                    var content = fs.readFileSync(this.activePath).toString('binary');
                    this.editor.setFile(this.activePath, this.metaDataPathLookUp[this.activePath].name, content);
                } catch (e) {
                    this.makeActive(null);
                    this.editor.setFile('', '', '');
                }
                setTimeout(() => {
                    this.refresh();
                }, 300);
            });

            // double-click: load item to editor
            $(this.id).on('dblclick', '.item', (e) => {
                var itemId = $(e.currentTarget).data('id');
                var itemName = this.metaData[itemId].name;

                if (this.metaData[itemId].isDirectory) {
                    // do nothing
                }
                else {
                    try {
                        this.makeActive(null);
                        var content = fs.readFileSync(this.metaData[itemId].path).toString('binary');
                        this.makeActive(this.metaData[itemId].path);
                        this.editor.setFile(self.metaData[itemId].path, self.metaData[itemId].name, content);


                        $.notific8('"' + itemName + '" is loaded', confirmNotific8Options);
                        $('span:contains("Code")').click().blur();
                    }
                    catch (e) {
                        $.notific8('Cannot load "' + itemName + '"', warningNotific8Options);
                    }
                }
            });

            // Save Hotkey
            this.editor.addKeyboardCommand(
                'saveFile',
                {
                    win: 'Ctrl-S',
                    mac: 'Command-S',
                    sender: 'editor|cli'
                },
                function(env, args, request) {
                    self.saveActiveFile();
                }
            );

            var rightClickedItem;
            var self = this;
            $(this.id).contextmenu({
                target: '#file-browser-context-menu',
                before: function(e, context) {
                    e.preventDefault();
                    // execute code before context menu if shown
                    rightClickedItem = $(e.target);
                    var itemId = rightClickedItem.data('id');
                    var menuContainer = this.getMenu().find('ul');
                    var menuHtml = '';

                    if (self.metaData[itemId].isDirectory) {
                        menuHtml += '<li><a data-action="newFile">New File</a></li>';
                        menuHtml += '<li><a data-action="newDir">New Directory</a></li>';
                    }
                    if (self.metaData[itemId].path != '') {
                        menuHtml += '<li><a data-action="rename">Rename</a></li>';
                        menuHtml += '<li><a data-action="delete">Delete</a></li>';
                    }
                    if (!self.metaData[itemId].isDirectory) {
                        menuHtml += '<li><a data-action="downloadFile">Download \''+ self.metaData[itemId].name +'\'</a></li>';
                    }
                    if (self.metaData[itemId].isDirectory) {
                        menuHtml += '<li><a data-action="downloadDir">Download \''+ self.metaData[itemId].name +'\' as .zip</a></li>';
                        menuHtml += '<li><a data-action="clone">Clone a repo into \'' + self.metaData[itemId].name + '\'...</a></li>';
                        menuHtml += '<li><a data-action="push">Push \''+ self.metaData[itemId].name + '\' to a repo...</a></li>';
                    }

                    menuContainer.html(menuHtml);
                },
                onItem: function(context, e) {
                    // execute on menu item selection
                    var $target = $(e.target);
                    var action = $target.data('action');
                    var itemId = rightClickedItem.data('id');
                    var itemName = self.metaData[itemId].name;
                    var itemPath = self.metaData[itemId].path;
                    var index;

                    if (action === 'delete') {
                        bootbox.confirm('Are you sure you want to delete the directory \'' + itemName + '\'?', function (result) {
                            if (result) {
                                if (self.metaData[itemId].isDirectory) {
                                    self.fs.removeDirectory(itemPath);
                                }
                                else {
                                    self.fs.deleteFile(itemPath);
                                }
                            }
                        });
                    }
                    else if (action === 'rename') {
                        bootbox.prompt({
                            title: 'Insert a new name for \'' + itemName + '\'',
                            value: itemName,
                            callback: function (result) {
                                if (result === null || result.trim().length === 0) {
                                    // do nothing
                                }
                                else {
                                    index = itemPath.indexOf(itemName);
                                    if (index === -1) {
                                        return;
                                    }
                                    else {
                                        self.fs.rename(itemPath, itemPath.slice(0, index) + result);
                                    }
                                }
                            }
                        });
                    }
                    else if (action === 'newDir') {
                        bootbox.prompt('New directory name', function (result) {
                            if (result === null || result.trim().length === 0) {
                                // do nothing
                            }
                            else {
                                self.fs.makeDirectory(itemPath + '/' + result);
                            }
                        });
                    }
                    else if (action === 'newFile') {
                        bootbox.prompt('New file name', function (result) {
                            if (result === null || result.trim().length === 0) {
                                // do nothing
                            }
                            else {
                                try {
                                    self.fs.readFileSync(itemPath + '/' + result).toString('binary');
                                    bootbox.alert('File already exists!');
                                }
                                catch (e) {
                                    self.fs.writeFile(itemPath + '/' + result, '');
                                }
                            }
                        });
                    }
                    else if (action === 'downloadFile') {
                        var text = self.fs.readFileSync(itemPath).toString('binary');
                        var blob = new Blob([text]);
                        saveAs(blob, itemName);
                    }
                    else if (action === 'downloadDir') {
                        var zip = new JSZip();

                        var addChildren = function(zipNode, itemPath) {
                            var children = self.fs.getDirectoryChildren(itemPath);

                            for(var i = 0; i < children.length; i++) {
                                if(children[i].isDirectory){
                                    var fol = zipNode.folder(children[i].name);
                                    addChildren(fol, itemPath + '/' + children[i].name);
                                }
                                else{
                                    var fileData = self.fs.readFileSync(itemPath + '/' + children[i].name).toString('binary');
                                    zipNode.file(children[i].name, fileData);
                                }
                            }
                        };

                        addChildren(zip, itemPath);

                        zip.generateAsync({type:'blob'}).then(function(content) {
                            saveAs(content, itemName + '.zip');
                        });
                    }
                    else if (action === 'clone') {
                        bootbox.dialog({
                            title: 'Clone a GitHub repo into \'' + itemName + '\'...',
                            message: '<div>'
                                +    '<div class="row">'
                                +        '<label class="col-sm-2 control-label"><small>Username (optional)</small></label>'
                                +        '<div class="col-sm-4">'
                                +            '<input id="githubUsername" class="form-control input-sm" type="text" maxlen=256>'
                                +        '</div>'
                                +        '<label class="col-sm-2 control-label"><small>Password</small></label>'
                                +        '<div class="col-sm-4">'
                                +            '<input id="githubPassword" class="form-control input-sm" type="password" maxlen=256>'
                                +        '</div>'
                                +    '</div>'
                                +    '<div class="row">'
                                +        '<label class="col-sm-2 control-label"><small>Repo URI</small></label>'
                                +        '<div class="col-sm-10">'
                                +            '<input id="githubRepo" class="form-control input-sm" type="text" maxlen=256 placeholder="username/repo-name">'
                                +        '</div>'
                                +    '</div>'
                                +'</div>',
                            buttons: {
                                success: {
                                    label: 'Clone',
                                    className: 'btn-primary',
                                    callback: function () {
                                        var username = $('#githubUsername').val();
                                        var password = $('#githubPassword').val();
                                        var repoName = $('#githubRepo').val();

                                        console.log('Clone Repo');

                                        if (repoName.trim().length === 0)
                                            return;

                                        var github;

                                        if((username.trim().length !== 0) && (password.trim().length !== 0))
                                            github = new GithubInt(username, password);
                                        else
                                            github = new GithubInt();

                                        github.cloneRepo(repoName, itemPath);
                                    }
                                }
                            }
                        });
                    }
                    else if (action === 'push') {
                        bootbox.dialog({
                            title: 'Push \''+ itemName + '\' to a GitHub repo...',
                            message: '<div>'
                                +    '<div class="row">'
                                +        '<label class="col-sm-2 control-label"><small>Username</small></label>'
                                +        '<div class="col-sm-4">'
                                +            '<input id="githubUsername" class="form-control input-sm" type="text" maxlen=256>'
                                +        '</div>'
                                +        '<label class="col-sm-2 control-label"><small>Password</small></label>'
                                +        '<div class="col-sm-4">'
                                +            '<input id="githubPassword" class="form-control input-sm" type="password" maxlen=256>'
                                +        '</div>'
                                +    '</div>'
                                +    '<div class="row">'
                                +        '<label class="col-sm-2 control-label"><small>Repo Name</small></label>'
                                +        '<div class="col-sm-10">'
                                +            '<input id="githubSaveRepo" class="form-control input-sm" type="text" maxlen=256 placeholder="sysprog-save">'
                                +        '</div>'
                                +    '</div>'
                                +'</div>',
                            buttons: {
                                success: {
                                    label: 'Push',
                                    className: 'btn-primary',
                                    callback: function () {
                                        var username = $('#githubUsername').val();
                                        var password = $('#githubPassword').val();
                                        var saveRepoName = $('#githubSaveRepo').val();

                                        console.log('Save Repo');

                                        if ((username.trim().length === 0) || (password.trim().length === 0)
                                            || (saveRepoName.trim().length === 0))
                                            return;

                                        var github = new GithubInt(username, password);

                                        github.saveAll(saveRepoName, itemPath);
                                    }
                                }
                            }
                        });
                    }
                }
            });

            // on right-click
            $('#file-browser').on('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });

            $('#file-browser').on('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            $('#file-browser').on('dragenter', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            $('#file-browser').on('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                var files = e.originalEvent.dataTransfer.files;
                var droppedLocationItem = $(e.target);
                var itemId = droppedLocationItem.data('id');
                var writeDroppedFile = function(i, done) {
                    (function (i) {
                        if (i === files.length) {
                            return done();
                        }

                        var file = files[i];
                        var reader = new FileReader();
                        reader.file = file;
                        reader.onload = function (e) {
                            if (itemId === undefined) {
                                fs.writeFile('/' +file.name, new Buffer(reader.result, 'binary'));
                                writeDroppedFile(i + 1, done);
                            }
                            else if (self.metaData[itemId].isDirectory) {
                                fs.writeFile(self.metaData[itemId].path + '/' +file.name, new Buffer(reader.result, 'binary'));
                                writeDroppedFile(i + 1, done);
                            }
                            else {
                                var newPath = self.metaData[itemId].parentPath + '/' + file.name;
                                if (self.metaData[itemId].parentPath == '/'){
                                    newPath = self.metaData[itemId].parentPath + file.name;
                                }
                                fs.writeFile(newPath, new Buffer(reader.result, 'binary'));
                                writeDroppedFile(i + 1, done);
                            }
                        };
                        reader.readAsBinaryString(file);
                    })(i);
                };

                writeDroppedFile(0, () => {});

                return false;
            });


            // toggle directory
            $(this.id).on('click', '.folder', (e) => {
                var $curr = $(e.currentTarget);
                var itemId = $curr.data('id');
                var data = this.metaData[itemId];
                var children;

                var iconClass = {
                    closed: 'glyphicon glyphicon-chevron-right',
                    opened: 'glyphicon glyphicon-chevron-down'
                };

                // open
                if ($curr.data('status') === 'closed') {
                    $curr.data('status', 'opened');

                    if (this.directoryState.indexOf(data.path) === -1)  {
                        this.directoryState.push(data.path);
                        this.directoryState.sort();
                    }

                    $curr
                    .find('i')
                    .removeClass(iconClass.closed)
                    .addClass(iconClass.opened);

                    children = this.fs.getDirectoryChildren(data.path);
                    this.assignChildren(data, children, data.path);

                    $curr.trigger('opened');
                }
                // collapse
                else {
                    $curr.data('status', 'closed');

                    this.directoryState = this._removeElemFromArray(this.directoryState, data.path).sort();

                    $curr
                    .find('i')
                    .removeClass(iconClass.opened)
                    .addClass(iconClass.closed);

                    for (var i = 0; i < data.children.length; i++) {
                        this.cleanUp(data.children[i]);
                    }

                    $curr.trigger('closed');
                }
            });

            // make program.c if not exists
            try {
                fs.readFileSync('/program.c');
            } catch (e) {
                fs.writeFile('/program.c', new Buffer(this.editor.getText(), 'binary'));
            }

            // init
            this.init();

            // make program.c active
            if (this.metaDataPathLookUp['/program.c']) {
                this.makeActive(null);
                var content = fs.readFileSync('/program.c').toString('binary');
                this.makeActive('/program.c');
                this.editor.setFile(self.metaDataPathLookUp['/program.c'].path, self.metaDataPathLookUp['/program.c'].name, content);
            }
        };

        if (SysRuntime.ready()) {
            window.setTimeout(() => {
                readyCallback();
            }, 300);
        }

        SysRuntime.addListener('ready', () => {
            readyCallback();
        });
    }

    _removeElemFromArray(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

    init() {
        var fs = this.fs;

        this.itemPrefix = 'fs-item-';
        this.indent = 30; // pixel

        // init
        this.children = [];
        this.metaData = {};
        this.metaDataPathLookUp = {};

        this.itemCounter = 0;

        this.assignChildren(this, [{
            isDirectory: true,
            name: 'home',
            isRoot: true
        }]);

        $(this.id).css('margin-bottom', '0px');
        this.draw();

        // mimic the state
        this.retrieveStates();
    }

    assignChildren(self, children, newPath) {
        var i;

        // clean up existing children
        for (i = 0; i < self.children.length; i++) {
            this.cleanUp(self.children[i]);
        }
        self.children = [];

        // sort before assign
        children.sort((a, b) => {
            if (a.isDirectory && b.isDirectory) {
                if (a.name > b.name) {
                    return -1;
                }
                if (b.name < a.name) {
                    return 1;
                }
                return 0;
            }
            else if (a.isDirectory && !b.isDirectory) {
                return -1;
            }
            else if (!a.isDirectory && b.isDirectory) {
                return 1;
            }
            else {
                if (a.name > b.name) {
                    return -1;
                }
                if (b.name < a.name) {
                    return 1;
                }
                return 0;
            }
        });

        // assign new children
        var itemData;
        var path;
        var activeOneExists = false;

        for (i = 0; i < children.length; i++) {
            /*
                isDirectory: false
                id: 'fs-item-0'
                name: 'name'
                parent: '/'
                path: '/name'
                depth: 0
                children: []
            */
            if (children[i].isRoot) {
                path = '';
                newPath = '';
            }
            else {
                path = (newPath ? newPath : '') + '/' + children[i].name;
            }

            itemData = {
                isDirectory: children[i].isDirectory,
                parentPath: newPath || '/',
                path: path,
                id: this.generateName(),
                name: this._escape(children[i].name),
                depth: self.depth + 1,
                children: []
            };

            self.children.push(itemData);

            this.metaData[itemData.id] = itemData;
            this.metaDataPathLookUp[path] = this.metaData[itemData.id];

            if (path === this.activePath) {
                activeOneExists = true;
            }

            this.itemCounter++;
        }

        // apply to DOM
        var str = '';

        for (i = 0; i < self.children.length; i++) {
            str += this.getItemDOM(self.children[i]);
        }

        // replace or append
        if (self.id.indexOf('#') === 0) {
            $(self.id).html(str);
        } else {
            $('#' + self.id).after(str);
        }

        if (activeOneExists) {
            this.makeActive(this.activePath);
        }
    }

    cleanUp(data) {
        $('#' + data.id).remove();

        for (var i = 0; i < data.children.length; i++) {
            this.cleanUp(data.children[i]);
        }

        data.children = [];

        delete this.metaData[data.id];
    }

    saveActiveFile() {
        var editorContent = this.editor.getText();
        var itemData = this.metaDataPathLookUp[this.activePath];

        if (itemData) {
            this.fs.writeFile(itemData.path, editorContent);
        } else {
            this.activePath = '';
            $.notific8('Error occurred while saving the file', warningNotific8Options);
        }
    }

    makeActive(itemPath) {
        $(this.id).find('.active-item').removeClass('active-item');
        if (itemPath && this.metaDataPathLookUp[itemPath]) {
            this.activePath = itemPath;
            $('#' + this.metaDataPathLookUp[itemPath].id).addClass('active-item');
            SysGlobalObservables.currentFileName(this.metaDataPathLookUp[itemPath].name);
            SysGlobalObservables.currentFilePath(this.metaDataPathLookUp[itemPath].path);
        }
        else {
            this.activePath = '';
            SysGlobalObservables.currentFileName('untitled');
            SysGlobalObservables.currentFilePath('');
        }
    }

    generateName() {
        this.itemCounter++;
        return this.itemPrefix + Date.now() + '-' + this.itemCounter;
    }

    getId() {
        return this.id;
    }

    draw() {
        var str = '';
        var activeFileData = this.metaDataPathLookUp[this.activePath];

        if (this.activePath !== '' && activeFileData) {
            var content = this.fs.readFileSync(activeFileData.path).toString('binary');
            this.editor.setFile(activeFileData.path, activeFileData.name, content);
            //self.editor.getSession().setValue(content);
        }

        for (var i = 0; i < this.children.length; i++) {
            str += this.getItemDOM(this.children[i]);
        }

        $(this.id).html(str);
    }

    retrieveStates() {
        var id;

        if (this.directoryState.length === 0) {
            id = this.metaDataPathLookUp[''].id;
            $('#' + id).trigger('click');
        }
        else {
            for (var i = 0; i < this.directoryState.length; i++) {
                if (this.metaDataPathLookUp[this.directoryState[i]]) {
                    id = this.metaDataPathLookUp[this.directoryState[i]].id;
                    $('#' + id).trigger('click');
                }
            }
        }
    }

    refresh() {
        this.init();
    }

    _escape(unsafe) {
        return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\//g, '&#x2F;');
    }

    getItemDOM(data) {
        if (data.isDirectory) {
            return '<div id="' + data.id + '" data-id="' + data.id + '" data-status="closed" class="item folder" style="margin-left:' + data.depth * this.indent + 'px;"> \
                <span class="item-icon"><i class="glyphicon glyphicon-chevron-right"></i></span>' + data.name + '</div>';
        }
        else {
            return '<div id="' + data.id + '"data-id="' + data.id + '" class="item file" style="margin-left:' + data.depth * this.indent + 'px;"> \
                <span class="item-icon"></span>' + data.name + '</div>';
        }
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Filebrowser, template: templateMarkup };
