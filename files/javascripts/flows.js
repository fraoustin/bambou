editorLog = CodeMirror.fromTextArea(document.getElementById("log"), {
        mode: {name: "log4j",},
        lineNumbers: false,
        matchBrackets: true
    });
editorLogView = CodeMirror.fromTextArea(document.getElementById("logview"), {
        mode: {name: "log4j",},
        lineNumbers: false,
        matchBrackets: true
    });
var bodyflow = `
<div>
    <table style="width:100%">
        <tr>
            <td><label class="siimple-label">Version: </label></td>
            <td><div class="siimple-navbar"><div class="siimple--float-right siimple-btn siimple-btn--big icon-tags siimple-btn--primary" onclick="viewVersion();"></div></div></td>
        </tr>
        <tr>
            <td><label class="siimple-label">Environment: </label></td>
            <td><div class="siimple-navbar"><div class="siimple--float-right siimple-btn siimple-btn--big icon-search siimple-btn--primary" onclick="viewEnvironment();"></div></div></td>
        </tr>
        <tr>
            <td><label class="siimple-label">Logs: </label></td>
            <td><div class="siimple-navbar"><div class="siimple--float-right siimple-btn siimple-btn--big icon-history siimple-btn--primary" onclick="viewLogs();"></div></div></td>
        </tr>
    </table>
</div>
`;

var footflow = `<div>
    <input type="file" id="fileupload" name="fileupload" multiple class="hidden"/>
    <div class="siimple-btn siimple-btn--big icon-upload siimple-btn--success" onclick="document.getElementById('fileupload').click();"></div>
    <div class="siimple--float-right siimple-btn siimple-btn--big icon-download siimple-btn--primary" onclick="downloadFlow();"></div>
</div>`;
function saveFlow(){
    saveJSON(canvas);
};

var canvas = new Canvas("gfx_holder"); 

canvas.on("click", function(emitter, event){
    clearProperty();
    document.getElementById("play").style.display = "";
    document.getElementById("save").style.display = "none";
    document.getElementById("property-footer").appendChild(htmlToElement(footflow));
    document.getElementById("property-body").appendChild(htmlToElement(bodyflow));
    document.getElementById("property-title").innerHTML = canvas.getUserData("name");
    document.getElementById("save").onclick = "save_parameterflow()";    
    document.getElementById('fileupload').addEventListener('change', function() {
        var fr=new FileReader();
        fr.onload=function(){
            uploadFlow(fr.result)
        }                
        fr.readAsText(this.files[0]);
    })
});


document.getElementById("modal-close-version").addEventListener("click", function () {
    document.getElementById("modal-version").style.display = "none";
});
document.getElementById("modal-close-run").addEventListener("click", function () {
    while (document.getElementById("env").firstChild) { document.getElementById("env").removeChild(document.getElementById("env").firstChild);};
    document.getElementById("modal-run").style.display = "none";
    document.getElementById("uidflow").value = "";
    document.getElementById("logflow").value = "";
    document.getElementById("isrunflow").value = "true";
    document.getElementById("runflowbutton").classList.remove("hidden");
    document.getElementById("stopflowbutton").classList.add("hidden");

});
document.getElementById("modal-close-env").addEventListener("click", function () {
    document.getElementById("modal-env").style.display = "none";
});
document.getElementById("modal-close-logs").addEventListener("click", function () {
    document.getElementById("modal-logs").style.display = "none";
});

function viewVersion(){
    while (document.getElementById("versions").firstChild) { document.getElementById("versions").removeChild(document.getElementById("versions").firstChild);};
    var xhttp = new XMLHttpRequest();        
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            versions = JSON.parse(this.responseText);
            versions.forEach(function(version){
                document.getElementById("versions").appendChild(htmlToElement("<tr><td><label class='siimple-label'>"+version[1]+"</label></td><td>"+version[2]+"</td><td class='min'><div class='siimple--float-right siimple-btn siimple-btn--big icon-del siimple-btn--error' value='"+version[0]+"' onclick='delVersion(this)'></div></td></tr>"))
            })
            document.getElementById('modal-version').style.display = '';
        };
    };
    var theUrl = "/flow/" + canvas.getUserData("id") + "/versions";
    xhttp.open("GET", theUrl);
    xhttp.send();
}

function delVersion(obj){
    var xhttp = new XMLHttpRequest();        
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            viewVersion()
        };
    };
    xhttp.open("GET", "/flow/" + canvas.getUserData("id") + "/version/" + obj.getAttribute("value") + "/del", true);
    xhttp.send();
};

function addVersion(obj){
    var xhttp = new XMLHttpRequest();        
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("version").value = "";
            viewVersion();
        };
    };
    xhttp.open("POST", "/flow/" + canvas.getUserData("id") + "/version", true);
    var data = new FormData();
    data.append("version", document.getElementById("version").value );
    xhttp.send(data);
};

function viewRun(){
    if ( Object.keys(canvas.getUserData('env')).length > 0 ){
        document.getElementById("modal-run").querySelectorAll("tr")[0].style.display = "";
    } else {
        document.getElementById("modal-run").querySelectorAll("tr")[0].style.display = "none";
    }
    for (var key in canvas.getUserData('env')) {
        document.getElementById("env").appendChild(htmlToElement("<option value='" + key + "'>"+ key +"</option>"));
    };
    document.getElementById('modal-run').style.display = '';
};

function saveEnvironment(){
    var env = {}
    var envs = []      
    Array.from(document.getElementById("modal-env").querySelectorAll(".siimple-table-header input")).forEach(function(obj){
        env[obj.value] = {}
        envs.push(obj.value)
    })        
    Array.from(document.getElementById("modal-env").querySelectorAll(".siimple-table-body .siimple-table-row")).forEach(function(row){
        if (row.querySelectorAll("input")[0].value.length > 0 ){ 
            for (let i = 0; i < envs.length; i++) {
                env[envs[i]][row.querySelectorAll("input")[0].value] = row.querySelectorAll("input")[i+1].value;
            }
        }
    })
    
    for (let i = 0; i < envs.length; i++) {
        if (envs[i].length == 0) {
            delete env[envs[i]];
        };
    }
    canvas.setUserData("env", env)
    saveFlow();
    document.getElementById('modal-env').style.display = 'none';
}

function viewEnvironment(){
    clearTable(document.getElementById('modal-env'));        
    document.getElementById("modal-env").querySelectorAll(".siimple-table-header")[0].appendChild(htmlToElement("<div class='siimple-table-row'><div class='siimple-table-cell'>Key/Environment</div></div>"));
    if ( Object.keys(canvas.getUserData('env')).length > 0 ){
        var envs =[];
        var keys = [];
        for (var env in canvas.getUserData('env')) {
            envs.push(env)
        };
        for (var key in canvas.getUserData('env')[envs[0]]) {
            keys.push(key)
            document.getElementById("modal-env").querySelectorAll(".siimple-table-body")[0].appendChild(htmlToElement("<div class='siimple-table-row'><div class='siimple-table-cell'><div class='del icon-del' onclick='removeKey(this)'><input class='siimple-input siimple-input--fluid' onclick='event.stopPropagation();' value='"+ key +"'></div></div></div>"));
        };
        for (let col = 0; col < envs.length; col++) {
            var env = envs[col]
            document.getElementById("modal-env").querySelectorAll(".siimple-table-header .siimple-table-row")[0].appendChild(htmlToElement("<div class='siimple-table-cell'><div class='del icon-del' onclick='removeEnvironment(this)'><input class='siimple-input siimple-input--fluid'  onclick='event.stopPropagation();' value='"+ env +"'></div></div>"));
        
            for (let row = 0; row < keys.length; row++) {
                var value = canvas.getUserData('env')[env][keys[row]]
                document.getElementById("modal-env").querySelectorAll(".siimple-table-body .siimple-table-row")[row].appendChild(htmlToElement("<div class='siimple-table-cell'><input class='siimple-input siimple-input--fluid' value='"+ value +"'></div>"));
            }
        }
    }        
    document.getElementById('modal-env').style.display = '';

}

function addEnvironment(){
    Array.from(document.getElementById("modal-env").querySelectorAll(".siimple-table-header .siimple-table-row")).forEach(function(obj){
        obj.appendChild(htmlToElement("<div class='siimple-table-cell'><div class='del icon-del' onclick='removeEnvironment(this)'><input class='siimple-input siimple-input--fluid'  onclick='event.stopPropagation();' value=''></div></div>"))
    });
    Array.from(document.getElementById("modal-env").querySelectorAll(".siimple-table-body .siimple-table-row")).forEach(function(obj){
        obj.appendChild(htmlToElement("<div class='siimple-table-cell'><input class='siimple-input siimple-input--fluid' value=''></div>"))
    });
}

function addKey(){
    nbrenv = document.getElementById("modal-env").querySelectorAll(".siimple-table-header .siimple-table-cell").length;
    document.getElementById("modal-env").querySelectorAll(".siimple-table-body")[0].appendChild(htmlToElement("<div class='siimple-table-row'></div>"))
    document.getElementById("modal-env").querySelectorAll(".siimple-table-body")[0].lastChild.appendChild(htmlToElement("<div class='siimple-table-cell'><div class='del icon-del' onclick='removeKey(this)'><input class='siimple-input siimple-input--fluid'  onclick='event.stopPropagation();' value=''></div></div>"));
    for (let cell = 1; cell < nbrenv; cell++) {
        document.getElementById("modal-env").querySelectorAll(".siimple-table-body")[0].lastChild.appendChild(htmlToElement("<div class='siimple-table-cell'><input class='siimple-input siimple-input--fluid' value=''></div>"));
    }
}

function removeEnvironment(obj){
    cols = Array.from(document.getElementById("modal-env").querySelectorAll(".siimple-table-header .siimple-table-cell"))
    idx = cols.indexOf(obj.parentNode)
    obj.parentNode.parentNode.removeChild(obj.parentNode)  
    Array.from(document.getElementById("modal-env").querySelectorAll(".siimple-table-body .siimple-table-row")).forEach(function(elt){
        elt.removeChild(elt.querySelectorAll(".siimple-table-cell")[idx])
    });
}

function removeKey(obj){
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode)  
}

function save_parameterflow(){
    saveFlow();
}

function viewLogs(){
    while (document.getElementById("idlog").firstChild) { document.getElementById("idlog").removeChild(document.getElementById("idlog").firstChild);};
    editorLogView.setValue(" ");
    var xhttp = new XMLHttpRequest();        
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            logs = JSON.parse(this.responseText);
            logs.forEach(function(log){
                document.getElementById("idlog").appendChild(htmlToElement("<option value='"+log[0]+"'>"+log[1]+"</option>)"))
            })
            if (logs.length > 0){
                refreshLog(document.getElementById("idlog").querySelectorAll("option")[0])
            }
            document.getElementById('modal-logs').style.display = '';
        };
    };
    var theUrl = "/flow/" + canvas.getUserData("id") + "/logs";
    xhttp.open("GET", theUrl);
    xhttp.send();

}

function _removeLog(idlog){
    var xhttp = new XMLHttpRequest();        
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            viewLogs()
        };
    };
    xhttp.open("GET", "/flow/" + canvas.getUserData("id") + "/log/" + idlog + "/del", true);
    xhttp.send(); 
}

function removeLog(){
    _removeLog(document.getElementById("idlog").value);
}

function refreshLog(elt){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            editorLogView.setValue(this.responseText);
        };
    };
    xhttp.open("GET", "/flow/" + canvas.getUserData("id") + "/log/" + elt.value, true);
    xhttp.send();        
}

function runFlow(){
    var xhttp = new XMLHttpRequest();        
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.responseText);
            document.getElementById("uidflow").value = obj["uid"]
            document.getElementById("logflow").value = obj["log"]
            viewLog();
            document.getElementById("runflowbutton").classList.add("hidden");
            document.getElementById("stopflowbutton").classList.remove("hidden");
        };
    };
    var theUrl = "/flow/" + canvas.getUserData("id") + "/run";
    xhttp.open("POST", theUrl);
    var data = new FormData();
    data.append("levellog", document.getElementById("levellog").value );
    data.append("env", document.getElementById("env").value );
    xhttp.send(data);
}

function stopFlow(){
    var xhttp = new XMLHttpRequest();
    var theUrl = "/flow/" + canvas.getUserData("id") + "/stop/" + document.getElementById("uidflow").value;
    xhttp.open("GET", theUrl, true);
    xhttp.send();
    document.getElementById("isrunflow").value = 'false';
    document.getElementById("runflowbutton").classList.remove("hidden");
    document.getElementById("stopflowbutton").classList.add("hidden");
}

function viewLog(){
    var log = document.getElementById("logflow").value;
    if (document.getElementById("modal-run").style.display == ""){      
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                editorLog.setValue(this.responseText);
                editorLog.scrollTo(0,editorLog.getScrollInfo()['height']);
                if (document.getElementById("isrunflow").value == 'true'){
                    setTimeout(viewLog, 1000)
                }
            };
        };
        xhttp.open("GET", "/flow/" + canvas.getUserData("id") + "/log/" + log, true);
        xhttp.send();
    };
}

function uploadFlow(data){        
    var objs = JSON.parse(data);
    var nodes = {};
    // create node
    objs['map'].forEach(function(obj){
        var node = new getClass[obj.type](obj.text)
        node.setUserData(obj['parameters'])
        nodes[obj.id] = node;
        canvas.add(node, obj.x, obj.y); 
    });
    // create connection
    objs['map'].forEach(function(obj){
        obj.outputports.forEach(function(outputport){
            outputport.target.forEach(function(item){
                var source = nodes[obj.id].getOutputPort(outputport.name);
                var target = nodes[item.id].getInputPort(item.name);
                var connection =createConnection(source, target);
                canvas.add(connection);
            }); 
        });
    });
    env = canvas.getUserData('env')
    Object.keys(objs["env"]).forEach(function(kenv){
        if (env.hasOwnProperty(kenv) == false){
            env[kenv]={}
        };
        Object.keys(objs["env"][kenv]).forEach(function(attr){
            if (env[kenv].hasOwnProperty(attr) == false){
                env[kenv][attr]=objs["env"][kenv][attr]
            }
        });
    })
    canvas.setUserData("env", env);
    canvas.onClick();
    saveFlow();
}

function downloadFlow(){        
    download_data(JSON.stringify(_saveJSON(canvas), null, 2), "flow.json", "text/json");
}

var getClass = {}

canvas.getCommandStack().addEventListener(function(e){
      if(e.isPostChangeEvent()){
          saveJSON(canvas);
      }
});
 
canvas.installEditPolicy(  new draw2d.policy.connection.DragConnectionCreatePolicy({
    createConnection: createConnection
}));

document.addEventListener("DOMContentLoaded",function () {     
           $("body").scrollTop(0)
                     .scrollLeft(0);     
});
$("body").keyup(function(e) {
    if (e.key === "Escape") { 
        var i = false;            
        Array.from(document.querySelectorAll(".siimple-modal")).forEach(function(obj){
            if (obj.style.display == "")
            {
                obj.style.display = "none";
                i = true;
            }
        });
        if (i == false){
            canvas.onClick();
        }
    }
});

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

$("body").keydown(function(e) {
    if(e.ctrlKey && e.keyCode === 187)  {
        canvas.setZoom(canvas.getZoom()*0.9,true);
        return false;
    };
    if(e.ctrlKey && e.keyCode === 54)  {
        canvas.setZoom(canvas.getZoom()*1.1,true);
        return false;
    };
    if(e.ctrlKey && e.keyCode === 83)  {
        if (document.getElementById("savemax")){
            if(findAncestor(document.getElementById("savemax"), "siimple-modal").style.display == ""){
                document.getElementById("savemax").click()
            }
        }
        document.getElementById("save").click()
        return false;
    };
    if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
        document.getElementById("play").click()
        return false;
    };        
    if(e.ctrlKey && e.altKey  && e.keyCode === 67)  {
        if (document.getElementById("property-id").value){
            var obj = canvas.getFigure(document.getElementById("property-id").value)
            canvas.copynode = {'type' : obj.cssClass, 'name': obj.children.data[0].figure.text, 'parameters': obj.getUserData()};
        }
        
    };     
    if(e.ctrlKey && e.altKey && e.keyCode === 86)  {
        if (canvas.copynode != null){
            var node = new getClass[canvas.copynode['type']](canvas.copynode['name'])
            node.setUserData(canvas.copynode['parameters'])
            node.changePath()
            addNode(canvas, node);
        };
        canvas.copynode = null;
        return false;
    };
});