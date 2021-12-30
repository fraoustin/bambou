var bodysubflow = `
<table id="subflow" style="width:100%">
    <tr>
        <td><label class="siimple-label">Flow: </label></td>
        <td>
        <select id="flow" name="flow" class="siimple-select siimple-select--fluid">
            <option value=""></option>
        </select>
        </td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Environment: </label></td>
        <td><input name="env" id="env" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Version: </label></td>
        <td><input name="version" id="version" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Level: </label></td>
        <td>
        <select id="level" name="level" class="siimple-select siimple-select--fluid">
            <option value="inherited">inherited</option>
            <option value="debug">debug</option>
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
            <option value="critical">critical</option>
        </select>
        </td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Add env</label></td>
        <td></td>
        <td class="minimal"><div class="siimple-btn--big icon-add siimple--float-right" onclick="add_newenv()"></div></td>
    </tr>
</table>
`;

var footsubflow = `
<div></div>
`;

var newenv = `
<tr class="newenv">
    <td>
        <input class="siimple-input siimple-input--fluid" value="">
    </td>
    <td><input class="siimple-input siimple-input--fluid" value=""</td>
    <td class="minimal"><div class="siimple-btn--big icon-del siimple--float-right" onclick="del_newenv(this)"></div></td>
</tr>
`;

var NodeSubflow = Node.extend({
    NAME: "subflow",
    init:function(name){
        this._super(name=name, path="/subflow/subflow.png");
        this.setUserData({
            "flow":"",
            "env":"",
            "level":"inherited",
            "version":"",
            "newenvs":[],
        });
        this.editor = null;
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footsubflow));
        document.getElementById("property-body").appendChild(htmlToElement(bodysubflow));        
        this.getUserData()["newenvs"].forEach(function(elt){
            document.getElementById("subflow").appendChild(htmlToElement(newenv));
            var obj = document.getElementById("subflow").querySelectorAll("tr.newenv:last-child")[0];
            obj.querySelectorAll("input")[0].value = elt["name"];
            obj.querySelectorAll("input")[1].value = elt["value"];
        })
        var xhttp = new XMLHttpRequest();        
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                flows = JSON.parse(this.responseText);
                flows['flows'].forEach(function(flow){
                    document.getElementById("flow").appendChild(htmlToElement("<option value='"+flow['id']+"'>"+flow['name']+"</option>"));
                });                
                document.getElementById("flow").value = canvas.getFigure(document.getElementById("property-id").value).getUserData()["flow"];
                document.getElementById("env").value = canvas.getFigure(document.getElementById("property-id").value).getUserData()["env"];
                document.getElementById("level").value = canvas.getFigure(document.getElementById("property-id").value).getUserData()["level"];
                document.getElementById("version").value = canvas.getFigure(document.getElementById("property-id").value).getUserData()["version"];
                document.getElementById("save").onclick = save_parametersubflow;
            };
        };
        var theUrl = "/flows";
        xhttp.open("GET", theUrl);
        xhttp.send();
    }
});

getClass["subflow"] = NodeSubflow;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-subflow" onclick="addNode(canvas, new NodeSubflow(\'Subflow\'));" title="subflow"></div></a>')
);


function save_parametersubflow(){
    var newenvs = []
    Array.from(document.getElementById("subflow").querySelectorAll("tr.newenv")).forEach(function(obj){
        var newenv = {'name':obj.querySelectorAll("input")[0].value,
            'value':obj.querySelectorAll("input")[1].value}
        newenvs.push(newenv)
    });
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "flow": document.getElementById("flow").value,
        "env": document.getElementById("env").value,
        "level": document.getElementById("level").value,
        "version": document.getElementById("version").value,
        "newenvs": newenvs
    });
    saveFlow();
}


function add_newenv(){
    document.getElementById("subflow").appendChild(htmlToElement(newenv));
    Array.from(document.getElementById("subflow").querySelectorAll("tr:last-child input")).forEach(function(obj){
        obj.addEventListener("keydown", tosave);
    });
    tosave()
}

function del_newenv(obj){
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode)
    tosave()
}
