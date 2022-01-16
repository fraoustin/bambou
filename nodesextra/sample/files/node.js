var bodylog = `
<table id="log" style="width:100%">
    <tr>
        <td><label class="siimple-label">Text: </label></td>
        <td><input name="text" id="text" class="siimple-input siimple-input--fluid" value="" required></td>
    </tr>
</table>
`;

var footlog = `<div></div>
`;

var NodeSample = Node.extend({
    NAME: "sample",
    init:function(name){
        this._super(name=name, path="/sample/sample.png");
        this.setUserData({
            "text":""
        })
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footlog));
        document.getElementById("property-body").appendChild(htmlToElement(bodylog));
        document.getElementById("text").value = this.getUserData()["text"];
        document.getElementById("save").onclick = save_parametersample;
    }
});

getClass["sample"] = NodeSample;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-sample" onclick="addNode(canvas, new NodeSample(\'Sample\'));" title="sample"></div></a>')
);


function save_parametersample(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "text": document.getElementById("text").value,
    });
    saveFlow();
}
