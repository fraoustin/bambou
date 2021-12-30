var bodygroupby = `
<div>
    <table id="groupby" style="width:100%">
        <tr>
            <td><label class="siimple-label">Group By</label></td>
            <td></td>
            <td class="minimal"><div class="siimple-btn--big icon-add siimple--float-right" onclick="add_groupby()"></div></td>
        </tr>
    </table>
    <table id="aggregate" style="width:100%">
        <tr>
            <td><label class="siimple-label">Aggregate</label></td>
            <td></td>
            <td class="minimal"><div class="siimple-btn--big icon-add siimple--float-right" onclick="add_aggregate()"></div></td>
        </tr>
    </table>
<div>
`;

var groupbyhtml = `
<tr class="groupby">
    <td>
    </td>
    <td><input class="siimple-input siimple-input--fluid" value=""></td>
    <td class="minimal"><div class="siimple-btn--big icon-del siimple--float-right" onclick="del_row(this)"></div></td>
</tr>
`;

var aggregatehtml = `
<tr class="aggregate">
    <td>
        <select class="siimple-select siimple-select--fluid">
            <option value="sum">sum</option>
            <option value="count">count</option>
            <option value="nunique">count distinct</option>
            <option value="mean">mean</option>
            <option value="median">median</option>
            <option value="min">min</option>
            <option value="max">max</option>
        </select>
    </td>
    <td><input class="siimple-input siimple-input--fluid" value=""></td>
    <td class="minimal"><div class="siimple-btn--big icon-del siimple--float-right" onclick="del_row(this)"></div></td>
</tr>
`

var footgroupby = `
<div></div>
`;
var NodeGroupby = Node.extend({
    NAME: "groupby",
    init:function(name){
        this._super(name=name, path="/groupby/groupby.png");
        this.setUserData({'groupbys' : [], 'aggs' : []})
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footgroupby));
        document.getElementById("property-body").appendChild(htmlToElement(bodygroupby));
        this.getUserData()["groupbys"].forEach(function(elt){
            document.getElementById("groupby").appendChild(htmlToElement(groupbyhtml));
            var obj = document.getElementById("groupby").querySelectorAll("tr.groupby:last-child")[0];
            obj.querySelectorAll("input")[0].value = elt
        })
        this.getUserData()["aggs"].forEach(function(elt){
            document.getElementById("aggregate").appendChild(htmlToElement(aggregatehtml));
            var obj = document.getElementById("aggregate").querySelectorAll("tr.aggregate:last-child")[0];
            obj.querySelectorAll("select")[0].value = elt["mode"]
            obj.querySelectorAll("input")[0].value = elt["col"]
        })

        document.getElementById("save").onclick = save_parametergroupby;
    }
});

getClass["groupby"] = NodeGroupby;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-groupby" onclick="addNode(canvas, new NodeGroupby(\'groupby\'));" title="groupby"></div></a>')
);


function save_parametergroupby(){    
    var groupbys = []
    Array.from(document.getElementById("groupby").querySelectorAll("tr.groupby")).forEach(function(obj){
        groupbys.push(obj.querySelectorAll("input")[0].value)
    });
    var aggs = []
    Array.from(document.getElementById("aggregate").querySelectorAll("tr.aggregate")).forEach(function(obj){
        var agg = {'mode':obj.querySelectorAll("select")[0].value,
            'col':obj.querySelectorAll("input")[0].value}
        aggs.push(agg)
    });
    canvas.getFigure(document.getElementById("property-id").value).setUserData({'groupbys' : groupbys, 'aggs' : aggs});
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

function add_aggregate(){
    document.getElementById("aggregate").appendChild(htmlToElement(aggregatehtml));
    tosave()
}