var bodydb = `
<table id="db" style="width:100%">
    <tr class="mssql pgsql mysql sqlite odbc csv xlsx json xml fwf">
        <td><label class="siimple-label">Connection type</label></td>
        <td>
        <select id="type" name="type" class="siimple-select siimple-select--fluid" onchange="refreshDb()">
            <option value="mssql">mssql</option>
            <option value="pgsql">pgsql</option>
            <option value="mysql">mysql</option>
            <option value="sqlite">sqlite</option>
            <option value="odbc">odbc</option>
            <option value="csv">csv</option>
            <option value="xlsx">xlsx</option>
            <option value="json">json</option>
            <option value="xml">xml</option>
            <option value="fwf">fixed-width formatted</option>
        </select>
        </td>
    </tr>
    <tr class="fwf">
        <td><label class="siimple-label">Definition: </label></td>
        <td class="minimal"><div class="siimple-btn--big icon-editconf siimple--float-right" onclick="editconffwf()"></div></td>
    </tr>
    <tr class="sqlite odbc">
        <td><label class="siimple-label">Url: </label></td>
        <td><input name="url" id="url" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="mssql pgsql mysql">
        <td><label class="siimple-label">Server: </label></td>
        <td><input name="server" id="server" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="mssql pgsql mysql">
        <td><label class="siimple-label">Port: </label></td>
        <td><input name="port" id="port" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="mssql pgsql mysql">
        <td><label class="siimple-label">User: </label></td>
        <td><input name="user" id="user" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="mssql pgsql mysql">
        <td><label class="siimple-label">Password: </label></td>
        <td><input name="password" id="password" class="siimple-input siimple-input--fluid" value="" type="password"></td>
    </tr>
    <tr class="mssql pgsql mysql">
        <td><label class="siimple-label">Database: </label></td>
        <td><input name="database" id="database" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="mssql pgsql mysql">
        <td><label class="siimple-label">Option Connexion: </label></td>
        <td><input name="optioncnx" id="optioncnx" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="mssql pgsql mysql sqlite odbc csv xlsx json xml fwf">
        <td><label class="siimple-label">Action</label></td>
        <td>
        <select id="action" name="action" class="siimple-select siimple-select--fluid" onchange="refreshDbAction()">
            <option value="read">read</option>
            <option value="write">write</option>
        </select>
        </td>
    </tr>
    <tr class="action read write mssql pgsql mysql sqlite odbc">
        <td><label class="siimple-label">Table: </label></td>
        <td><input name="table" id="table" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="action read mssql pgsql mysql sqlite odbc">
        <td><label class="siimple-label">ou</label></td>
        <td></td>
    </tr>
    <tr class="action read mssql pgsql mysql sqlite odbc">
        <td><label class="siimple-label">Query: </label></td>
        <td>
            <div style="display: flow-root">
                <div class="siimple-btn--big icon-maxquery siimple--float-right" onclick="maxQuery()"></div>
            </div>
            <textarea name="query" id="query" class="siimple-textarea siimple-textarea--fluid"></textarea>
        </td>
    </tr>
    <tr class="action write mssql pgsql mysql sqlite odbc">
        <td><label class="siimple-label">If exists</label></td>
        <td>
        <select id="ifexists" name="ifexists" class="siimple-select siimple-select--fluid">
            <option value="append">append</option>
            <option value="replace">replace</option>
            <option value="fail">fail</option>
        </select>
        </td>
    </tr>
    <tr class="action write mssql pgsql mysql sqlite odbc">
        <td><label class="siimple-label">Method insert</label></td>
        <td>
        <select id="method" name="method" class="siimple-select siimple-select--fluid">
            <option value="">single</option>
            <option value="multi">multi</option>
        </select>
        </td>
    </tr>
    <tr class="action read write csv xlsx json xml fwf">
        <td><label class="siimple-label">path: </label></td>
        <td><input name="pathfile" id="pathfile" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="action read write csv">
        <td><label class="siimple-label">delimiter: </label></td>
        <td><input name="delimiter" id="delimiter" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="action read write json">
        <td><label class="siimple-label">orient: </label></td>
        <td>
            <select id="orient" name="orient" class="siimple-select siimple-select--fluid">
                <option value="split">split</option>
                <option value="records">records</option>
                <option value="index">index</option>
                <option value="columns">columns</option>
                <option value="values">values</option>
            </select>
        </td>
    </tr>
    <tr class="action read write xlsx">
        <td><label class="siimple-label">sheet: </label></td>
        <td><input name="sheet" id="sheet" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="action write mssql pgsql mysql sqlite odbc csv xlsx json xml fwf">
        <td><label class="siimple-label">Drop Index</label></td>
        <td>
        <select id="dropindex" name="dropindex" class="siimple-select siimple-select--fluid" onchange="refreshDb()">
            <option value="true">True</option>
            <option value="false">False</option>
        </select>
        </td>
    </tr>
    <tr class="csv xlsx json xml fwf">
        <td><label class="siimple-label">Location</label></td>
        <td>
        <select id="loc" name="loc" class="siimple-select siimple-select--fluid" onchange="refreshLocation()">
            <option value="local">local</option>
            <option value="sftp">sftp</option>
            <option value="webdav">webdav</option>
        </select>
        </td>
    </tr>
    <tr class="location csv xlsx json xml fwf">
        <td><label class="siimple-label">server: </label></td>
        <td><input name="locserver" id="locserver" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="location csv xlsx json xml fwf">
        <td><label class="siimple-label">port: </label></td>
        <td><input name="locport" id="locport" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="location csv xlsx json xml fwf">
        <td><label class="siimple-label">user: </label></td>
        <td><input name="locuser" id="locuser" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="location csv xlsx json xm fwf">
        <td><label class="siimple-label">password: </label></td>
        <td><input name="locpassword" id="locpassword" class="siimple-input siimple-input--fluid" value="" type="password"></td>
    </tr>
</table>
`;


var modalquery = `  
<div class="siimple-modal siimple-modal--extra-large" id="modal-query" style="display:none;">
    <div class="siimple-modal-content">
        <div class="siimple-modal-header">
            <div class="siimple-modal-header-title"></div>
            <div class="siimple-modal-header-close" id="modal-query-close"></div>
        </div>
        <div class="siimple-modal-body">
            <textarea name="querymax" id="querymax" class="siimple-textarea siimple-textarea--fluid"></textarea>
        </div>
        <div class="siimple-modal-footer">
            <div class="siimple-navbar">
                <div class="siimple--float-right">
                    <div id="savemax" class="siimple--float-right siimple-btn siimple-btn--big icon-save siimple-btn--primary" onclick="saveMaxQuery()"></div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
var modaleditconffwf = `  
<div class="siimple-modal siimple-modal" id="modal-editconffwf" style="display:none;">
    <div class="siimple-modal-content">
        <div class="siimple-modal-header">
            <div class="siimple-modal-header-title">Editor Fixed-Width Formatted</div>
            <div class="siimple-modal-header-close" id="modal-editconffwf-close"></div>
        </div>
        <div class="siimple-modal-body" style="height: 80%;">
            <table id="editconffwf-gen" style="width:100%">
                <tr>
                    <td><label class="siimple-label">Skip rows header: </label></td>
                    <td><input name="skiprows" id="skiprows" class="siimple-input siimple-input--fluid" value=""></td>
                </tr>
                <tr>
                    <td><label class="siimple-label">Skip rows footer: </label></td>
                    <td><input name="skipfooter" id="skipfooter" class="siimple-input siimple-input--fluid" value=""></td>
                </tr>
            </table>
            <table id="editconffwf-fields" style="width:100%">
                <tr>
                    <td><label class="siimple-label">Fields</label></td>
                    <td>Start</td>
                    <td>End</td>
                    <td class="minimal"><div class="siimple-btn--big icon-add siimple--float-right" onclick="add_fields()"></div></td>
                </tr>
            </table>
        </div>
    </div>
</div>
`;

var addfields = `
<tr class="fields">
    <td><input class="siimple-input siimple-input--fluid" value=""></td>
    <td><input class="siimple-input siimple-input--fluid" value=""></td>
    <td><input class="siimple-input siimple-input--fluid" value=""></td>
    <td class="minimal"><div class="siimple-btn--big icon-del siimple--float-right" onclick="del_row(this)"></div></td>
</tr>
`;

var footdb = `
<div></div>
`;
var NodeDb = Node.extend({
    NAME: "db",
    init:function(name){
        this._super(name=name, path="/db/dbout.png");
        this.setUserData({
            "user":"",
            "password" : "",
            "type" : "mssql",
            "url" : "/your/path",
            "server" : "",
            "port" : "",
            "database" : "",
            "optioncnx" : "",
            "action" : "write",
            "table" : "",
            "query" : "",
            "actqueryion" : "",
            "ifexists" : "append",
            "method" : "multi",
            "pathfile" : "",
            "delimiter" : ";",
            "orient" : "index",
            "sheet" : "Sheet1",
            "dropindex" : "false",
            "loc" : "local",
            "locserver" : "",
            "locport" : "",
            "locuser" : "",
            "locpassword" : "",
            "skiprows" : 0,
            "skipfooter" : 0,
            "fields" : []

        })
        this.editor = null;
        this.editormax = null;
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footdb));
        document.getElementById("property-body").appendChild(htmlToElement(bodydb));
        document.getElementById("type").value = this.getUserData()["type"];
        document.getElementById("user").value = this.getUserData()["user"];
        document.getElementById("password").value = this.getUserData()["password"];
        document.getElementById("server").value = this.getUserData()["server"];
        document.getElementById("url").value = this.getUserData()["url"];
        document.getElementById("port").value = this.getUserData()["port"];
        document.getElementById("database").value = this.getUserData()["database"];
        document.getElementById("optioncnx").value = this.getUserData()["optioncnx"];
        document.getElementById("action").value = this.getUserData()["action"];
        document.getElementById("table").value = this.getUserData()["table"];
        document.getElementById("query").value = this.getUserData()["query"];
        document.getElementById("ifexists").value = this.getUserData()["ifexists"];
        document.getElementById("method").value = this.getUserData()["method"];
        document.getElementById("pathfile").value = this.getUserData()["pathfile"];
        document.getElementById("delimiter").value = this.getUserData()["delimiter"];
        document.getElementById("orient").value = this.getUserData()["orient"];
        document.getElementById("sheet").value = this.getUserData()["sheet"];
        document.getElementById("dropindex").value = this.getUserData()["dropindex"];
        document.getElementById("loc").value = this.getUserData()["loc"];
        document.getElementById("locserver").value = this.getUserData()["locserver"];
        document.getElementById("locport").value = this.getUserData()["locport"] || '';
        document.getElementById("locuser").value = this.getUserData()["locuser"];
        document.getElementById("locpassword").value = this.getUserData()["locpassword"];
        document.getElementById("save").onclick = save_parameterdb;
        var hgt = document.body.clientHeight - 535;
        document.getElementById('query').style.height = hgt + "px";
        this.editor = CodeMirror.fromTextArea(document.getElementById("query"), {
            mode: {name: "sql",
                    version: 3,
                    singleLineStringErrors: false},
            lineNumbers: false,
            indentUnit: 4,
            matchBrackets: true,
            onChange: function (cm) {
                tosave()
            }
        });
        document.querySelectorAll(".CodeMirror")[0].style.height = hgt + "px";

        if (document.getElementById("modal-query") != null ){
            document.getElementById("modal-query").parentNode.removeChild(document.getElementById("modal-query"))
        }

        document.getElementById("content").appendChild(htmlToElement(modalquery));
        document.getElementById("modal-query-close").addEventListener("click", function () {
            document.getElementById("modal-query").style.display = "none";
        });

        if (document.getElementById("modal-editconffwf") != null ){
            document.getElementById("modal-editconffwf").parentNode.removeChild(document.getElementById("modal-editconffwf"))
        }

        document.getElementById("content").appendChild(htmlToElement(modaleditconffwf));
        document.getElementById("modal-editconffwf-close").addEventListener("click", function () {
            document.getElementById("modal-editconffwf").style.display = "none";
        });
        document.getElementById("skiprows").value = this.getUserData()["skiprows"] || "0";
        document.getElementById("skipfooter").value = this.getUserData()["skipfooter"] || "0";
        var fields = this.getUserData()["fields"] || []; 
        fields.forEach(function(elt){
            document.getElementById("editconffwf-fields").appendChild(htmlToElement(addfields));
            var obj = document.getElementById("editconffwf-fields").querySelectorAll("tr.fields:last-child")[0];
            obj.querySelectorAll("input")[0].value = elt["field"]
            obj.querySelectorAll("input")[1].value = elt["start"]
            obj.querySelectorAll("input")[2].value = elt["end"]
        })

        this.editormax = CodeMirror.fromTextArea(document.getElementById("querymax"), {
            mode: {name: "sql",
                    version: 3,
                    singleLineStringErrors: false},
            lineNumbers: true,
            indentUnit: 4,
            matchBrackets: true
        });
        this.editormax.on("change",function(){tosavebyid("savemax")})
        var hgt = document.body.clientHeight - 245;
        document.querySelectorAll("#modal-query .siimple-modal-body")[0].style.height = hgt + "px";
        hgt = hgt - 40
        document.querySelectorAll("#modal-query .siimple-modal-body .CodeMirror")[0].style.height = hgt + "px";
        refreshDb();
        refreshDbAction();
    },
    getCode: function(){
        return this.editor.getValue();
    },
    changePath:function(){
        if (this.getUserData()["action"] == "write") {
            this.setPath("/db/dbout.png");
        } else {
            this.setPath("/db/dbin.png");
        }
    }
});

getClass["db"] = NodeDb;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-db" onclick="addNode(canvas, new NodeDb(\'Data\'));" title="data"></div></a>')
);


function save_parameterdb(){
    var fields = []
    Array.from(document.getElementById("editconffwf-fields").querySelectorAll("tr.fields")).forEach(function(obj){
        var field = {'field':obj.querySelectorAll("input")[0].value,
            'start':obj.querySelectorAll("input")[1].value,
            'end':obj.querySelectorAll("input")[2].value
        }
        fields.push(field)
    });
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "user": document.getElementById("user").value,
        "password": document.getElementById("password").value,
        "type": document.getElementById("type").value,
        "url": document.getElementById("url").value,
        "server": document.getElementById("server").value,
        "port": document.getElementById("port").value,
        "database": document.getElementById("database").value,
        "optioncnx": document.getElementById("optioncnx").value,
        "action": document.getElementById("action").value,
        "table": document.getElementById("table").value,
        "query": canvas.getFigure(document.getElementById("property-id").value).editor.getValue(),
        "ifexists": document.getElementById("ifexists").value,
        "method": document.getElementById("method").value,
        "pathfile": document.getElementById("pathfile").value,
        "delimiter": document.getElementById("delimiter").value,
        "orient": document.getElementById("orient").value,
        "sheet": document.getElementById("sheet").value,
        "dropindex": document.getElementById("dropindex").value,
        "loc": document.getElementById("loc").value,
        "locserver": document.getElementById("locserver").value,
        "locport": document.getElementById("locport").value || '',
        "locuser": document.getElementById("locuser").value,
        "locpassword": document.getElementById("locpassword").value,
        "skipfooter": document.getElementById("skipfooter").value,
        "skiprows": document.getElementById("skiprows").value,
        "fields": fields
    });
    saveFlow();
    canvas.getFigure(document.getElementById("property-id").value).changePath();
}

function refreshDb(){
    Array.from(document.getElementById("db").querySelectorAll("tr."+document.getElementById("type").value)).forEach(function(tr){
        tr.style.display="";
    });
    Array.from(document.getElementById("db").querySelectorAll("tr:not(."+document.getElementById("type").value+")")).forEach(function(tr){
        tr.style.display="none";
    });
    refreshDbAction();
}

function refreshDbAction(){
    Array.from(document.getElementById("db").querySelectorAll("tr.action."+document.getElementById("action").value+"."+document.getElementById("type").value)).forEach(function(tr){
        tr.style.display="";
    })
    Array.from(document.getElementById("db").querySelectorAll("tr.action:not(."+document.getElementById("action").value+"."+document.getElementById("type").value+")")).forEach(function(tr){
        tr.style.display="none";
    })
    if (document.getElementById("action").value == "write") {
        document.getElementById("editconffwf-gen").style.display="none";
    } else {
        document.getElementById("editconffwf-gen").style.display="";
    }
    refreshLocation();
}

function refreshLocation(){
    if (document.getElementById("loc").value == 'local' || ['mssql', 'pgsql', 'mysql', 'sqlite'].includes(document.getElementById("type").value)){
        Array.from(document.getElementById("db").querySelectorAll("tr.location")).forEach(function(tr){
            tr.style.display="none";
        })
    }else{
        Array.from(document.getElementById("db").querySelectorAll("tr.location")).forEach(function(tr){
            tr.style.display="";
        })
    }    
}

function maxQuery(){
    document.getElementById('modal-query').style.display = '';
    canvas.getFigure(document.getElementById("property-id").value).editormax.getDoc().setValue(canvas.getFigure(document.getElementById("property-id").value).editor.getValue());
    document.querySelectorAll('#modal-query .siimple-modal-header-title')[0].innerHTML = canvas.getFigure(document.getElementById("property-id").value).children.data[0].figure.text;
}

function saveMaxQuery(){
    canvas.getFigure(document.getElementById("property-id").value).editor.getDoc().setValue(canvas.getFigure(document.getElementById("property-id").value).editormax.getValue());
    save_parameterdb();    
    document.getElementById("savemax").classList.remove("siimple-btn--error");
    document.getElementById("savemax").classList.add("siimple-btn--primary");
}

function editconffwf(){
    document.getElementById('modal-editconffwf').style.display = '';
    tosave();
}

function add_fields(){
    document.getElementById("editconffwf-fields").appendChild(htmlToElement(addfields));
    
}

function del_row(obj){
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode)
}

function saveFields(){
    save_parameterdb();
}