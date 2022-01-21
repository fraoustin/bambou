var bodytransform = `
<table id="transform" style="width:100%">
    <tr>
        <td><label class="siimple-label">Step</label></td>
        <td></td>
        <td class="minimal"><div class="siimple-btn--big icon-add siimple--float-right" onclick="add_step()"></div></td>
    </tr>
</table>
`;

var foottransform = `
<div></div>
`;

var step = `
<tr class="step">
    <td>
        <select id="action" name="action" class="siimple-select siimple-select--fluid" onchange="refreshAction(this)">
            <option value="dropcol">drop col.</option>
            <option value="rename">rename</option>
            <option value="query">query</option>
            <option value="sort">sort</option>
            <option value="type">type</option>
            <option value="pivot">pivot</option>
            <option value="limit">limit</option>
            <option value="addcol">add column</option>
        </select>
    </td>
    <td><input class="siimple-input siimple-input--fluid" value=""><input class="hidden siimple-input siimple-input--fluid" value=""><input class="hidden siimple-input siimple-input--fluid" value="">
    <select class="siimple-select siimple-select--fluid hidden">
        <option value="ascending">ascending</option>
        <option value="descending">descending</option>
    </select>
    </td>
    <td class="minimal"><div class="siimple-btn--big icon-del siimple--float-right" onclick="del_step(this)"></div></td>
</tr>
`;

var NodeTransform = Node.extend({
    NAME: "transform",
    init:function(name){
        this._super(name=name, path="/transform/cog.png");
        this.setUserData({"steps":[]});
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(foottransform));
        document.getElementById("property-body").appendChild(htmlToElement(bodytransform));
        this.getUserData()["steps"].forEach(function(elt){
            document.getElementById("transform").appendChild(htmlToElement(step));
            var obj = document.getElementById("transform").querySelectorAll("tr.step:last-child")[0];
            obj.querySelectorAll("select")[0].value = elt["action"];
            obj.querySelectorAll("input")[0].value = elt["param1"];
            obj.querySelectorAll("input")[1].value = elt["param2"];
            obj.querySelectorAll("input")[2].value = elt["param3"];
            obj.querySelectorAll("select")[1].value = elt["sort"] || '';
            refreshAction(obj.querySelectorAll("select")[0]);
        })
        document.getElementById("save").onclick = save_parametertransform;
    }
});

getClass["transform"] = NodeTransform;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-param" onclick="addNode(canvas, new NodeTransform(\'Transform\'));" title="transform"></div></a>')
);


function save_parametertransform(){
    var steps = []
    Array.from(document.getElementById("transform").querySelectorAll("tr.step")).forEach(function(obj){
        var step = {'action':obj.querySelectorAll("select")[0].value,
            'param1':obj.querySelectorAll("input")[0].value,
            'param2':obj.querySelectorAll("input")[1].value,
            'param3':obj.querySelectorAll("input")[2].value,
            'sort':obj.querySelectorAll("select")[1].value}
        steps.push(step)
    });
    canvas.getFigure(document.getElementById("property-id").value).setUserData({'steps' : steps});
    saveFlow();
}

function add_step(){
    document.getElementById("transform").appendChild(htmlToElement(step));
    Array.from(document.getElementById("transform").querySelectorAll("tr:last-child input")).forEach(function(obj){
        obj.addEventListener("keydown", tosave);
    });
    Array.from(document.getElementById("transform").querySelectorAll("tr:last-child select")).forEach(function(obj){
        obj.addEventListener("change", tosave);
    });
    Array.from(document.getElementById("transform").querySelectorAll("tr:last-child textarea")).forEach(function(obj){
        obj.addEventListener("keydown", tosave);
    });
    tosave()
}

function del_step(obj){
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode)
    tosave()
}

function refreshAction(obj){
    var tr = obj.parentNode.parentNode
    if (['rename', 'type','pivot', 'addcol'].includes(obj.value)){
        tr.querySelectorAll("input")[1].classList.remove("hidden");
        tr.querySelectorAll("input")[2].classList.add("hidden");
    };
    if (['dropcol', 'query', 'sort', 'limit'].includes(obj.value)){
        tr.querySelectorAll("input")[1].classList.add("hidden");
        tr.querySelectorAll("input")[2].classList.add("hidden");
    };
    if (['pivot'].includes(obj.value)){
        tr.querySelectorAll("input")[2].classList.remove("hidden");
    };
    if (['rename', 'type','pivot', 'addcol','dropcol', 'query', 'limit'].includes(obj.value)){
        tr.querySelectorAll("select")[1].classList.add("hidden");
    };
    if (['sort', ].includes(obj.value)){
        tr.querySelectorAll("select")[1].classList.remove("hidden");
    };
}

