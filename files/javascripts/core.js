var ErrorPort = draw2d.OutputPort.extend({
        init:function(name){
            this._super({"bgColor": "#EF5350", "cssClass": "errorport"});
            this.name=name;
        }, 
});

var OutPort = draw2d.OutputPort.extend({
        init:function(name, color){
            this._super({"bgColor": color, "cssClass": "outport"});
            this.name=name;
        }, 
});

var OutPortBasic = OutPort.extend({
        init:function(name){
            this._super(name, "#9CCC65");
        }, 
});

var InPort = draw2d.InputPort.extend({
    init:function(name, color){
        this._super({"bgColor": color, "cssClass": "inport"});  
        this.name=name;             
        this.on("connect",function(){this.setVisible(false);},this);
        this.on("disconnect",function(){this.setVisible(true);},this);
    }, 
    onConnect: function( connection ){
        try {
            if ( ["#EF5350", "#9E9E9E"].indexOf(connection.sourcePort.bgColor.hashString) !== -1){
                connection.setColor(connection.sourcePort.bgColor.hashString)
                connection.getTargetDecorator().setBackgroundColor(connection.sourcePort.bgColor.hashString)
            }else{
                connection.setColor(connection.targetPort.bgColor.hashString)
                connection.getTargetDecorator().setBackgroundColor(connection.targetPort.bgColor.hashString)
            }
        } catch (error) {}
    }
});

var InPortBasic = InPort.extend({
    init:function(name){
        this._super(name, "#42A5F5");
    }
});

var Node = draw2d.shape.basic.Image.extend({
    NAME: "node",
    init:function(name, path){
        this._super({path: path, width:48, height:48, resizeable: false});
        this.addPort(new InPortBasic("in1"));
        this.addPort(new OutPortBasic("out1"));
        this.addPort(new ErrorPort("error"));
        this.label = new draw2d.shape.basic.Label({text:name});      
        this.add(this.label, new draw2d.layout.locator.BottomLocator(this));
        this.label.installEditor(new draw2d.ui.LabelInplaceEditor({
            onCommit: $.proxy(function(value){
                this.onClick(null, null);
            },this)
        }));

		this.on("select", function(emitter, event){
			emitter.onClick(emitter, event)
		});

		this.on("removed", function(emitter, event){
			canvas.onClick(null, null)
        });
                
    },
    onClick:function(emitter, event){
        clearProperty();
        document.getElementById("property-title").innerHTML = this.children.data[0].figure.text;
        document.getElementById("property-id").value = this.id;
        document.getElementById("play").style.display = "none";
        document.getElementById("save").style.display = "";
        this.setPanelParameter();
        Array.from(document.getElementById("property-body").querySelectorAll("input")).forEach(function(obj){
            obj.addEventListener("keydown", tosave);
        });
        Array.from(document.getElementById("property-body").querySelectorAll("select")).forEach(function(obj){
            obj.addEventListener("change", tosave);
        });
        Array.from(document.getElementById("property-body").querySelectorAll("textarea")).forEach(function(obj){
            obj.addEventListener("keydown", tosave);
        });
        saved();
    },
    setPanelParameter:function(){},
    changePath:function(){}
});

var Canvas = draw2d.Canvas.extend({
    init:function(name){
        this._super(name);
        this.userData = {};
        this.copynode = null;
    },
    getUserData:function(name){
        return this.userData[name]
    },
    setUserData:function(name, value){
        this.userData[name] = value;
    },
});

var createConnection=function(sourcePort, targetPort){    
    var conn= new draw2d.Connection({
        router:new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
        outlineStroke:1,
        stroke:3,
        radius:20,
        source:sourcePort,
        target:targetPort
    });
    var arrow = new draw2d.decoration.connection.ArrowDecorator();
    arrow.setDimension(15, 10);
    conn.setTargetDecorator(arrow);
    try {
        if ( ["#EF5350", "#9E9E9E"].indexOf(conn.sourcePort.bgColor.hashString) !== -1 ){
            arrow.setBackgroundColor(conn.sourcePort.bgColor.hashString);
        } else {
            arrow.setBackgroundColor(conn.targetPort.bgColor.hashString);
        }
    } catch (error) {}
    return conn;
};

function _saveJSON(canvas){    
    var all = {
        "flow" : {
            "id" : canvas.getUserData("id"),
            "name" : canvas.getUserData("name"),
            "resume" : canvas.getUserData("resume"),
        },
        "map" : [],
        "env" : canvas.getUserData("env")
    }
    var objs = []
    canvas.figures.data.forEach(function(obj){
        var dict = {"id": obj.id,
            "type": obj.cssClass,
            "text": (obj.children.data[0] === undefined) ? "" : obj.children.data[0].figure.text,
            "x": obj.x,
            "y": obj.y
        }
        var inputports = []
        obj.inputPorts.data.forEach(function(input){
            inputports.push({
                "id" : input.id,
                "name" : input.name
            })
        });
        dict["inputports"] = inputports;
        var outputports = []
        obj.outputPorts.data.forEach(function(output){
            var dictoutput = {
                "idport" : output.id,
                "name" : output.name,
                "target" : []
            };
            canvas.lines.data.forEach(function(line){
                if (output.id == line.sourcePort.id) {
                    dictoutput.target.push({"name" : line.targetPort.name,
                        "idport" : line.targetPort.id,
                        "id" : line.targetPort.getParent().id})
                };
            });
            outputports.push(dictoutput)
        });
        dict["outputports"] = outputports;
        if (obj.getUserData() == null) {
            dict["parameters"] = {}
        } else {
            dict["parameters"] = obj.getUserData()
        };        
        objs.push(dict)
    });
    all["map"] = objs;
    return all

}

function saveJSON(canvas){
    all = _saveJSON(canvas)
    var xmlhttp = new XMLHttpRequest();
    var theUrl = "/map/"+canvas.getUserData("id");
    xmlhttp.open("POST", theUrl);
    var data = new FormData();
    data.append("map", JSON.stringify(all, null, 2));
    xmlhttp.send(data);
    saved()
}

function readJSON(canvas, id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var objs = JSON.parse(this.responseText);
            var nodes = {};
            // create node
            objs['map'].forEach(function(obj){
                var node = new getClass[obj.type](obj.text)
                node.setUserData(obj['parameters'])
                node.changePath()
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
            canvas.setUserData("id", objs["flow"]["id"]);
            canvas.setUserData("name", objs["flow"]["name"]);
            canvas.setUserData("resume", objs["flow"]["resume"]);
            canvas.setUserData("env", objs["env"]);
            canvas.onClick();
        };
    };
    xhttp.open("GET", "/map/"+id, true);
    xhttp.send();
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
};

function addNode(canvas, obj){
    canvas.add(obj, window.scrollX+10, window.scrollY+10);
    saveFlow();

};

function clearProperty(){
    while (document.getElementById("property-footer").firstChild) { document.getElementById("property-footer").removeChild(document.getElementById("property-footer").firstChild);};
    while (document.getElementById("property-body").firstChild) { document.getElementById("property-body").removeChild(document.getElementById("property-body").firstChild);};
}    

function tosave(){
    tosavebyid("save")
}

function tosavebyid(id){
    if (document.getElementById(id).classList.contains("siimple-btn--primary")) {
        document.getElementById(id).classList.remove("siimple-btn--primary");
        document.getElementById(id).classList.add("siimple-btn--error");
    };
}

function saved(){
    if (document.getElementById("save").classList.contains("siimple-btn--error")) {
        document.getElementById("save").classList.remove("siimple-btn--error");
        document.getElementById("save").classList.add("siimple-btn--primary");
    };
}

function clearProperty(){
    clearElt(document.getElementById("property-footer"));
    clearElt(document.getElementById("property-body"));
}

function clearTable(elt){
    Array.from(elt.querySelectorAll(".siimple-table-row")).forEach(function(obj){
        obj.parentNode.removeChild(obj);
    });
}

function clearElt(elt){
    while (elt.firstChild) { elt.removeChild(elt.firstChild);};   
}