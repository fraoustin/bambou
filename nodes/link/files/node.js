var bodylink = `
<table id="link" style="width:100%">
    <tr class="concat join">
        <td><label class="siimple-label">Action</label></td>
        <td>
        <select id="type" name="type" class="siimple-select siimple-select--fluid" onchange="refreshType()">
            <option value="concat">concat</option>
            <option value="join">join</option>
        </select>
        </td>
    </tr>
    <tr class="concat">
        <td><label class="siimple-label">axis</label></td>
        <td>
        <select id="axis" name="axis" class="siimple-select siimple-select--fluid">
            <option value="0">index</option>
            <option value="1">columns</option>
        </select>
        </td>
    </tr>
    <tr class="concat">
        <td><label class="siimple-label">join</label></td>
        <td>
        <select id="join" name="join" class="siimple-select siimple-select--fluid">
            <option value="inner">inner</option>
            <option value="outer">outer</option>
        </select>
        </td>
    </tr>
    <tr class="join">
        <td><label class="siimple-label">how</label></td>
        <td>
        <select id="how" name="how" class="siimple-select siimple-select--fluid">
            <option value="left">left</option>
            <option value="right">right</option>
            <option value="outer">outer</option>
            <option value="inner">inner</option>
            <option value="cross">cross</option>
        </select>
        </td>
    </tr>
    <tr class="join">
        <td><label class="siimple-label">Left on </label></td>
        <td><input name="left_on" id="left_on" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="join">
        <td><label class="siimple-label">Left suffix </label></td>
        <td><input name="left_suffix" id="left_suffix" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="join">
        <td><label class="siimple-label">Right on </label></td>
        <td><input name="right_on" id="right_on" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="join">
        <td><label class="siimple-label">Right suffix </label></td>
        <td><input name="right_suffix" id="right_suffix" class="siimple-input siimple-input--fluid" value=""></td>
    </tr>
    <tr class="join">
        <td><label class="siimple-label">indicator</label></td>
        <td>
        <select id="indicator" name="indicator" class="siimple-select siimple-select--fluid">
            <option value="True">True</option>
            <option value="False">False</option>
        </select>
        </td>
    </tr>
    <tr class="join">
        <td><label class="siimple-label">validate</label></td>
        <td>
        <select id="validate" name="validate" class="siimple-select siimple-select--fluid">
            <option value=""></option>
            <option value="one_to_one">one_to_one</option>
            <option value="one_to_many">one_to_many</option>
            <option value="many_to_one">many_to_one</option>
            <option value="many_to_many">many_to_many</option>
        </select>
        </td>
    </tr>
</table>
`;

var InPortLink = InPort.extend({
    init:function(name){
        this._super(name, "#FF9800");
    }
});

var footlink = `
<div></div>
`;
var NodeLink = Node.extend({
    NAME: "link",
    init:function(name){
        this._super(name=name, path="/link/link.png");
        this.setUserData({
            "type" : "concat",
            "axis" : "0",
            "join" : "inner",
            "how" : "inner",
            "left_on" : "",
            "left_suffix" : "_l",
            "right_on" : "",
            "right_suffix" : "_r",
            "indicator" : "False",
            "validate" : ""
        })
        this.addPort(new InPortLink("in2"));
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footlink));
        document.getElementById("property-body").appendChild(htmlToElement(bodylink));
        document.getElementById("type").value = this.getUserData()["type"];
        document.getElementById("axis").value = this.getUserData()["axis"];
        document.getElementById("join").value = this.getUserData()["join"];
        document.getElementById("how").value = this.getUserData()["how"];
        document.getElementById("left_on").value = this.getUserData()["left_on"];
        document.getElementById("left_suffix").value = this.getUserData()["left_suffix"];
        document.getElementById("right_on").value = this.getUserData()["right_on"];
        document.getElementById("right_suffix").value = this.getUserData()["right_suffix"];
        document.getElementById("indicator").value = this.getUserData()["indicator"];
        document.getElementById("validate").value = this.getUserData()["validate"];
        document.getElementById("save").onclick = save_parameterlink;
        refreshType();
    }
});

getClass["link"] = NodeLink;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-link" onclick="addNode(canvas, new NodeLink(\'link\'));" title="concat, merge, join"></div></a>')
);


function save_parameterlink(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "type": document.getElementById("type").value,
        "axis": document.getElementById("axis").value,
        "join": document.getElementById("join").value,
        "how": document.getElementById("how").value,
        "left_on": document.getElementById("left_on").value,
        "left_suffix": document.getElementById("left_suffix").value,
        "right_on": document.getElementById("right_on").value,
        "right_suffix": document.getElementById("right_suffix").value,
        "indicator": document.getElementById("indicator").value,
        "validate": document.getElementById("validate").value
    });
    saveFlow();
}

function refreshType(){
    Array.from(document.getElementById("link").querySelectorAll("tr."+document.getElementById("type").value)).forEach(function(tr){
        tr.style.display="";
    });
    Array.from(document.getElementById("link").querySelectorAll("tr:not(."+document.getElementById("type").value+")")).forEach(function(tr){
        tr.style.display="none";
    });
}