var bodyhtmljinja = `
<div id="jinja">
    <table style="width:100%">
        <tr class="sftp local">
            <td><label class="siimple-label">Destination</label></td>
            <td>
                <select id="dest" name="dest" class="siimple-select siimple-select--fluid" onchange="refreshLocationJinja()">
                    <option value="local">local</option>
                    <option value="sftp">sftp</option>
                </select>
            </td>
        </tr>
        <tr class="dest sftp">
            <td><label class="siimple-label">server: </label></td>
            <td><input name="locserver" id="locserver" class="siimple-input siimple-input--fluid" value=""></td>
        </tr>
        <tr class="dest sftp">
            <td><label class="siimple-label">user: </label></td>
            <td><input name="locuser" id="locuser" class="siimple-input siimple-input--fluid" value=""></td>
        </tr>
        <tr class="dest sftp">
            <td><label class="siimple-label">password: </label></td>
            <td><input name="locpassword" id="locpassword" class="siimple-input siimple-input--fluid" value="" type="password"></td>
        </tr>
        <tr class="dest sftp local">
            <td><label class="siimple-label">destination path: </label></td>
            <td><input name="path" id="path" class="siimple-input siimple-input--fluid" value=""></td>
        </tr>
        <tr class="template path code">
            <td><label class="siimple-label">Template</label></td>
            <td>
                <select id="templatesrc" name="templatesrc" class="siimple-select siimple-select--fluid" onchange="refreshTemplateJinja()">
                    <option value="path">path</option>
                    <option value="code">code</option>
                </select>
            </td>
        </tr>        
        <tr class="template path">
            <td><label class="siimple-label">template path: </label></td>
            <td><input name="templatepath" id="templatepath" class="siimple-input siimple-input--fluid" value=""></td>
        </tr>
    </table>
    <div class="template code">
        <div style="display: flow-root">
            <div class="siimple-btn--big icon-htmljinjamax siimple--float-right" onclick="maxHtmljinja()"></div>
        </div>
        <textarea name="htmljinja" id="htmljinja" class="siimple-textarea siimple-textarea--fluid"></textarea>
    </div>
</div>
`;

var foothtmljinja = `
<div></div>
`;


var modalhtmljinja = `  
<div class="siimple-modal siimple-modal--extra-large" id="modal-htmljinja" style="display:none;">
    <div class="siimple-modal-content">
        <div class="siimple-modal-header">
            <div class="siimple-modal-header-title"></div>
            <div class="siimple-modal-header-close" id="modal-htmljinja-close"></div>
        </div>
        <div class="siimple-modal-body">
            <textarea name="htmljinjamax" id="htmljinjamax" class="siimple-textarea siimple-textarea--fluid"></textarea>
        </div>
        <div class="siimple-modal-footer">
            <div class="siimple-navbar">
                <div class="siimple--float-right">
                    <div class="siimple--float-right siimple-btn siimple-btn--big icon-save siimple-btn--primary" onclick="saveMaxHtmljinja()"></div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

var NodeHtmljinja = Node.extend({
    NAME: "htmljinja",
    init:function(name){
        this._super(name=name, path="/htmljinja/htmljinja.png");
        this.setUserData({
            "template":"<html></html>",
            "dest" : "local",
            "locserver" : "",
            "locuser" : "",
            "locpassword" : "",
            "path" : "",
            "templatesrc" : "code",
            "templatepath" : ""
        });
        this.editor = null;
        this.editormax = null;
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(foothtmljinja));
        document.getElementById("property-body").appendChild(htmlToElement(bodyhtmljinja));
        document.getElementById("dest").value = this.getUserData()["dest"];
        document.getElementById("locserver").value = this.getUserData()["locserver"];
        document.getElementById("locuser").value = this.getUserData()["locuser"];
        document.getElementById("locpassword").value = this.getUserData()["locpassword"];
        document.getElementById("path").value = this.getUserData()["path"];
        document.getElementById("htmljinja").value = this.getUserData()["template"];
        document.getElementById("templatesrc").value = this.getUserData()["templatesrc"];
        document.getElementById("templatepath").value = this.getUserData()["templatepath"];
        var hgt = document.body.clientHeight - 400;
        document.getElementById('htmljinja').style.height = hgt + "px";
        var mixedMode = {
            name: "htmlmixed",
            scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
                        mode: null},
                        {matches: /(text|application)\/(x-)?vb(a|script)/i,
                        mode: "vbscript"}]
        };
        this.editor = CodeMirror.fromTextArea(document.getElementById("htmljinja"), {
            mode: mixedMode,
            selectionPointer: true
        });
        document.querySelectorAll("#property-body .CodeMirror")[0].style.height = hgt + "px";
        document.getElementById("save").onclick = save_parameterhtmljinja;

        if (document.getElementById("modal-htmljinja") != null ){
            document.getElementById("modal-htmljinja").parentNode.removeChild(document.getElementById("modal-htmljinja"))
        }

        document.getElementById("content").appendChild(htmlToElement(modalhtmljinja));
        document.getElementById("modal-htmljinja-close").addEventListener("click", function () {
            document.getElementById("modal-htmljinja").style.display = "none";
        });
        this.editormax = CodeMirror.fromTextArea(document.getElementById("htmljinjamax"), {
            mode: mixedMode,
            selectionPointer: true,
            lineNumbers: true,
        });
        var hgt = document.body.clientHeight - 245;
        document.querySelectorAll("#modal-htmljinja .siimple-modal-body")[0].style.height = hgt + "px";
        hgt = hgt - 40
        document.querySelectorAll("#modal-htmljinja .siimple-modal-body .CodeMirror")[0].style.height = hgt + "px";
        refreshLocationJinja();
        refreshTemplateJinja();
    },
    getHtmljinja: function(){
        return this.editor.getValue();
    }
});

getClass["htmljinja"] = NodeHtmljinja;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-htmljinja" onclick="addNode(canvas, new NodeHtmljinja(\'Jinja\'));" title="jinja"></div></a>')
);


function save_parameterhtmljinja(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "template": canvas.getFigure(document.getElementById("property-id").value).getHtmljinja(),
        "dest": document.getElementById("dest").value,
        "locserver": document.getElementById("locserver").value,
        "locuser": document.getElementById("locuser").value,
        "locpassword": document.getElementById("locpassword").value,
        "path": document.getElementById("path").value,
        "templatepath": document.getElementById("templatepath").value,
        "templatesrc": document.getElementById("templatesrc").value,
    });
    saveFlow();
}

function maxHtmljinja(){
    document.getElementById('modal-htmljinja').style.display = '';
    canvas.getFigure(document.getElementById("property-id").value).editormax.getDoc().setValue(canvas.getFigure(document.getElementById("property-id").value).editor.getValue());
    document.querySelectorAll('#modal-htmljinja .siimple-modal-header-title')[0].innerHTML = canvas.getFigure(document.getElementById("property-id").value).children.data[0].figure.text;
}

function saveMaxHtmljinja(){
    canvas.getFigure(document.getElementById("property-id").value).editor.getDoc().setValue(canvas.getFigure(document.getElementById("property-id").value).editormax.getValue());
    save_parameterhtmljinja();
}

function refreshLocationJinja(){
    Array.from(document.getElementById("jinja").querySelectorAll("tr.dest."+document.getElementById("dest").value)).forEach(function(tr){
        tr.style.display="";
    })
    Array.from(document.getElementById("jinja").querySelectorAll("tr.dest:not(."+document.getElementById("dest").value+")")).forEach(function(tr){
        tr.style.display="none";
    })   
}

function refreshTemplateJinja(){
    Array.from(document.getElementById("jinja").querySelectorAll(".template."+document.getElementById("templatesrc").value)).forEach(function(tr){
        tr.style.display="";
    })
    Array.from(document.getElementById("jinja").querySelectorAll(".template:not(."+document.getElementById("templatesrc").value+")")).forEach(function(tr){
        tr.style.display="none";
    })   
}
