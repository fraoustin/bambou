var bodysynchro = `
<table style="width:100%">
</table>
`;

var footsynchro = `
<div class="siimple--float-right siimple-btn siimple-btn--big icon-save siimple-btn--primary" id="save" onclick="save_parametersynchro()"></div>
`;

var InPortSynchro = draw2d.InputPort.extend({
    init:function(name, color){
        this._super({"bgColor": color, "cssClass": "inport"});  
        this.name=name;
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
})

var NodeSynchro = Node.extend({
    NAME: "synchro",
    init:function(name){
        this._super(name=name, path="/synchro/synchro.png");
        this.setUserData({});
        this.addPort(new InPortSynchro("in2", "#FF9800"));
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footsynchro));
        document.getElementById("property-body").appendChild(htmlToElement(bodysynchro));
    }
});

getClass["synchro"] = NodeSynchro;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-synchro" onclick="addNode(canvas, new NodeSynchro(\'synchro\'));" title="synchronize"></div></a>')
);


function save_parametersynchro(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({});
    saveFlow();
}