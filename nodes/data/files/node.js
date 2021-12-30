var bodydata = `
<table style="width:100%">
    <tr>
        <td><label class="siimple-label">Limit: </label></td>
        <td><input name="limit" id="limit" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Drop Index</label></td>
        <td>
        <select id="dropindex" name="dropindex" class="siimple-select siimple-select--fluid" onchange="refreshDb()">
            <option value="true">True</option>
            <option value="false">False</option>
        </select>
        </td>
    </tr>
</table>
`;

var footdata = `
<div></div>
`;

var modaldata = `  
<div class="siimple-modal siimple-modal--medium" id="modal-data" style="display:none;">
    <div class="siimple-modal-content">
        <div class="siimple-modal-header">          
            <div class="search icon-search"><input id="search" type="text" class="siimple-input"><div class="siimple-modal-header-close" id="modal-data-close"></div></div> 
            
        </div>
        <div class="siimple-modal-body">
            <div class="siimple-table" id="data-table" style="overflow:auto">
                <div class="siimple-table-header">
                    <div class="siimple-table-row">
                    </div>
                </div>
                <div class="siimple-table-body">
                </div>
            </div>
        </div>
        <div class="siimple-modal-footer">
            <div class="siimple-navbar">
                <div class="siimple--float-right">
                    <div class="siimple--float-right siimple-btn siimple-btn--big icon-download siimple-btn--primary" onclick="dataDownload()"></div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

var NodeData = Node.extend({
    NAME: "data",
    init:function(name){
        this._super(name=name, path="/data/data.png");
        var uid = (new Date().getTime()).toString(36)
        this.setUserData({
            "idflow" : "<< _id >>",
            "uid": uid,
            "limit" : "100",
            "dropindex" : "false"});
		this.on("dblclick", function(emitter, event){
            if (document.getElementById("modal-data") == null ){
                document.getElementById("content").appendChild(htmlToElement(modaldata));
                document.getElementById("modal-data-close").addEventListener("click", function () {
                    document.getElementById("modal-data").style.display = "none"; 
                    clearElt(document.getElementById("data-table").querySelectorAll(".siimple-table-header .siimple-table-row")[0])
                    clearElt(document.getElementById("data-table").querySelectorAll(".siimple-table-body")[0])
                });
            };
            var xhttp = new XMLHttpRequest();        
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    datas = JSON.parse(this.responseText);
                    datas["header"].forEach(function(head){
                        document.getElementById("modal-data").querySelectorAll(".siimple-table-header .siimple-table-row")[0].appendChild(htmlToElement("<div class='siimple-table-cell' title='" + head + "'>" + head + "</div>"));
                    });
                    datas["rows"].forEach(function(row){
                        document.getElementById("modal-data").querySelectorAll(".siimple-table-body")[0].appendChild(htmlToElement("<div class='siimple-table-row'></div>"));
                        row.forEach(function(elt){
                            document.getElementById("modal-data").querySelectorAll(".siimple-table-body .siimple-table-row:last-child")[0].appendChild(htmlToElement("<div class='siimple-table-cell'>" + elt + "</div>"));
                        });
                    });
                    document.getElementById('modal-data').style.display = '';
                    // manage header
                    var i = 0;
                    Array.from(document.getElementById("modal-data").querySelectorAll(".siimple-table-header .siimple-table-row .siimple-table-cell")).forEach(function(obj){
                        obj.style.maxWidth  = document.getElementById("modal-data").querySelectorAll(".siimple-table-body .siimple-table-row:last-child")[0].querySelectorAll('.siimple-table-cell')[i].clientWidth + "px";
                        obj.style.width  = document.getElementById("modal-data").querySelectorAll(".siimple-table-body .siimple-table-row:last-child")[0].querySelectorAll('.siimple-table-cell')[i].clientWidth + "px";
                        i = i+1
                    });                    
                    document.getElementById("search").addEventListener("input", function(){searchAdvanced("search", "data-table")});
                };
            };
            var theUrl = "/flow/" + canvas.getUserData("id") + "/data/" + emitter.getUserData()["uid"];
            xhttp.open("GET", theUrl);
            xhttp.send();
		});
		this.on("removed", function(emitter, event){
			var xhttp = new XMLHttpRequest();
            var theUrl = "/flow/" + canvas.getUserData("id") + "/data/" + emitter.getUserData()["uid"] + "/del";
            xhttp.open("GET", theUrl);
            xhttp.send();
		});
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footdata));
        document.getElementById("property-body").appendChild(htmlToElement(bodydata));
        document.getElementById("limit").value = this.getUserData()["limit"];
        document.getElementById("dropindex").value = this.getUserData()["dropindex"];
        document.getElementById("save").onclick = save_parameterdata;
    }
});

getClass["data"] = NodeData;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-data" onclick="addNode(canvas, new NodeData(\'view data\'));" title="view data"></div></a>')
);


function save_parameterdata(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "idflow" : canvas.getFigure(document.getElementById("property-id").value).getUserData()['idflow'],
        "uid": canvas.getFigure(document.getElementById("property-id").value).getUserData()['uid'],
        "limit": document.getElementById("limit").value,
        "dropindex": document.getElementById("dropindex").value,
    });
    saveFlow();
}

function dataDownload(){
    export_table_to_csv('data-table', 'data.csv')
}