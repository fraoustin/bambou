var bodyforeach = `
<table id="groupby" style="width:100%">
    <tr>
        <td><label class="siimple-label">Group By</label></td>
        <td></td>
        <td class="minimal"><div class="siimple-btn--big icon-add siimple--float-right" onclick="add_groupby()"></div></td>
    </tr>
</table>
`;

var footforeach = `
<div></div>
`;

var groupbyhtml = `
<tr class="groupby">
    <td>
    </td>
    <td><input class="siimple-input siimple-input--fluid" value=""></td>
    <td class="minimal"><div class="siimple-btn--big icon-del siimple--float-right" onclick="del_row(this)"></div></td>
</tr>
`;

var NodeForeach = Node.extend({
    NAME: "foreach",
    init:function(name){
        this._super(name=name, path="/foreach/foreach.png");
        this.setUserData({
            "groupbys":[],
        });
        this.editor = null;
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footforeach));
        document.getElementById("property-body").appendChild(htmlToElement(bodyforeach));
        this.getUserData()["groupbys"].forEach(function(elt){
            document.getElementById("groupby").appendChild(htmlToElement(groupbyhtml));
            var obj = document.getElementById("groupby").querySelectorAll("tr.groupby:last-child")[0];
            obj.querySelectorAll("input")[0].value = elt
        })
        document.getElementById("save").onclick = save_parameterforeach;
    }
});

getClass["foreach"] = NodeForeach;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-foreach" onclick="addNode(canvas, new NodeForeach(\'For-each\'));" title="foreach"></div></a>')
);

function save_parameterforeach(){    
    var groupbys = []
    Array.from(document.getElementById("groupby").querySelectorAll("tr.groupby")).forEach(function(obj){
        groupbys.push(obj.querySelectorAll("input")[0].value)
    });
    canvas.getFigure(document.getElementById("property-id").value).setUserData({'groupbys' : groupbys});
    saveFlow();
}

function add_groupby(){
    document.getElementById("groupby").appendChild(htmlToElement(groupbyhtml));
    tosave()
}

function del_row(obj){
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode)
    tosave()
}