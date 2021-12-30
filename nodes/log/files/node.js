var bodylog = `
<table id="log" style="width:100%">
    <tr>
        <td><label class="siimple-label">Destination: </label></td>
        <td>
        <select id="dest" name="dest" class="siimple-select siimple-select--fluid" onchange="refreshLogSelect()">
            <option value="log">log</option>
            <option value="syslog">syslog</option>
            <option value="graylog">graylog</option>
        </select>
        </td>
    </tr>
    <tr>
        <td><label class="siimple-label">Level: </label></td>
        <td>
        <select id="level" name="level" class="siimple-select siimple-select--fluid">
            <option value="debug">debug</option>
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
            <option value="critical">critical</option>
        </select>
        </td>
    </tr>
    <tr>
        <td><label class="siimple-label">Text: </label></td>
        <td><input name="text" id="text" class="siimple-input siimple-input--fluid" value="" required></td>
    </tr>
    <tr class="graylog">
        <td><label class="siimple-label">Graylog IP: </label></td>
        <td><input name="graylogip" id="graylogip" class="siimple-input siimple-input--fluid" value="" required></td>
    </tr>
    <tr class="graylog">
        <td><label class="siimple-label">Graylog PORT: </label></td>
        <td><input name="graylogport" id="graylogport" class="siimple-input siimple-input--fluid" value="" required></td>
    </tr>
</table>
`;

var footlog = `<div></div>
`;

var NodeLog = Node.extend({
    NAME: "log",
    init:function(name){
        this._super(name=name, path="/log/log.png");
        this.setUserData({
            "dest":"log",
            "text":"",
            "level":"info",
            "graylogip":"",
            "graylogport":""
        })
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footlog));
        document.getElementById("property-body").appendChild(htmlToElement(bodylog));
        document.getElementById("dest").value = this.getUserData()["dest"];
        document.getElementById("text").value = this.getUserData()["text"];
        document.getElementById("level").value = this.getUserData()["level"];
        document.getElementById("graylogip").value = this.getUserData()["graylogip"];
        document.getElementById("graylogport").value = this.getUserData()["graylogport"];
        document.getElementById("save").onclick = save_parameterlog;
        refreshLogSelect();
    }
});

getClass["log"] = NodeLog;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-log" onclick="addNode(canvas, new NodeLog(\'Log\'));" title="log"></div></a>')
);


function save_parameterlog(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "dest": document.getElementById("dest").value,
        "text": document.getElementById("text").value,
        "level": document.getElementById("level").value,
        "graylogport": document.getElementById("graylogport").value,
        "graylogip": document.getElementById("graylogip").value
    });
    saveFlow();
}

function refreshLogSelect(){
    if (document.getElementById("log").querySelectorAll("select")[0].value == 'graylog'){
        Array.from(document.getElementById("log").querySelectorAll(".graylog")).forEach(function(elt){
            elt.style.display="";
        })
    } else {
        Array.from(document.getElementById("log").querySelectorAll(".graylog")).forEach(function(elt){
            elt.style.display="none";
        })        
    }
}