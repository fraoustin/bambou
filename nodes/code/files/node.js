var bodycode = `
<div>
    <div style="display: flow-root">
        <div class="siimple-btn--big icon-codemax siimple--float-right" onclick="maxCode()"></div>
    </div>
    <textarea name="code" id="code" class="siimple-textarea siimple-textarea--fluid"></textarea>
</div>
`;

var footcode = `
<div></div>
`;


var modalcode = `  
<div class="siimple-modal siimple-modal--extra-large" id="modal-code" style="display:none;">
    <div class="siimple-modal-content">
        <div class="siimple-modal-header">
            <div class="siimple-modal-header-title"></div>
            <div class="siimple-modal-header-close" id="modal-code-close"></div>
        </div>
        <div class="siimple-modal-body">
            <textarea name="codemax" id="codemax" class="siimple-textarea siimple-textarea--fluid"></textarea>
        </div>
        <div class="siimple-modal-footer">
            <div class="siimple-navbar">
                <div class="siimple--float-right">
                    <div id="savemax" class="siimple--float-right siimple-btn siimple-btn--big icon-save siimple-btn--primary" onclick="saveMaxCode()"></div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

var NodeCode = Node.extend({
    NAME: "code",
    init:function(name){
        this._super(name=name, path="/code/code.png");
        this.setUserData({
            "code":"out = self.in1"
        });
        this.editor = null;
        this.editormax = null;
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footcode));
        document.getElementById("property-body").appendChild(htmlToElement(bodycode));
        document.getElementById("code").value = this.getUserData()["code"];
        var hgt = document.body.clientHeight - 180;
        document.getElementById('code').style.height = hgt + "px";
        this.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
            mode: {name: "python",
                    version: 3,
                    singleLineStringErrors: false},
            lineNumbers: false,
            indentUnit: 4,
            matchBrackets: true,
            onChange: function (cm) {
                tosave()
            }
        });
        document.querySelectorAll("#property-body .CodeMirror")[0].style.height = hgt + "px";
        document.getElementById("save").onclick = save_parametercode;

        if (document.getElementById("modal-code") != null ){
            document.getElementById("modal-code").parentNode.removeChild(document.getElementById("modal-code"))
        }

        document.getElementById("content").appendChild(htmlToElement(modalcode));
        document.getElementById("modal-code-close").addEventListener("click", function () {
            document.getElementById("modal-code").style.display = "none";
        });
        this.editormax = CodeMirror.fromTextArea(document.getElementById("codemax"), {
            mode: {name: "python",
                    version: 3,
                    singleLineStringErrors: false},
            lineNumbers: true,
            indentUnit: 4,
            matchBrackets: true
        });
        this.editormax.on("change",function(){tosavebyid("savemax")})
        var hgt = document.body.clientHeight - 245;
        document.querySelectorAll("#modal-code .siimple-modal-body")[0].style.height = hgt + "px";
        hgt = hgt - 40
        document.querySelectorAll("#modal-code .siimple-modal-body .CodeMirror")[0].style.height = hgt + "px";
    },
    getCode: function(){
        return this.editor.getValue();
    }
});

getClass["code"] = NodeCode;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-code" onclick="addNode(canvas, new NodeCode(\'Code\'));" title="code"></div></a>')
);


function save_parametercode(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "code": canvas.getFigure(document.getElementById("property-id").value).getCode()  
    });
    saveFlow();
}

function maxCode(){
    document.getElementById('modal-code').style.display = '';
    canvas.getFigure(document.getElementById("property-id").value).editormax.getDoc().setValue(canvas.getFigure(document.getElementById("property-id").value).editor.getValue());
    document.querySelectorAll('#modal-code .siimple-modal-header-title')[0].innerHTML = canvas.getFigure(document.getElementById("property-id").value).children.data[0].figure.text;
}

function saveMaxCode(){
    canvas.getFigure(document.getElementById("property-id").value).editor.getDoc().setValue(canvas.getFigure(document.getElementById("property-id").value).editormax.getValue());
    document.getElementById("savemax").classList.remove("siimple-btn--error");
    document.getElementById("savemax").classList.add("siimple-btn--primary");
    save_parametercode();
}

