var bodycomment = `
<div>
    <table style="width:100%">
        <tr class="action read write json">
            <td><label class="siimple-label">color: </label></td>
            <td>
                <select id="colorcomment" name="colorcomment" class="siimple-select siimple-select--fluid">
                    <option value="orange">orange</option>
                    <option value="yellow">yellow</option>
                    <option value="green">green</option>
                    <option value="blue">blue</option>
                    <option value="red">red</option>
                    <option value="grey">grey</option>
                </select>
            </td>
        </tr>
    </table>
    <textarea name="comment" id="comment" class="siimple-textarea siimple-textarea--fluid"></textarea>
</div>
`;

var footcomment = `<div></div>
`;

var colorcomment = {'orange' : ["#FFF3E0", "#E65100"],
'yellow' : ["#FFFDE7", "#F57F17"],
'green' : ["#F1F8E9", "#33691E"],
'blue' : ["#E1F5FE", "#01579B"],
'purple' : ["#EDE7F6", "#311B92"],
'red' : ["#FFEBEE", "#B71C1C"],
'grey' : ["#ECEFF1", "#263238"],
}

var NodeComment = draw2d.shape.note.PostIt.extend({
    NAME: "comment",
    init:function(text){
        this._super({text:text});
        this.setUserData({
            "comment":text,
            "color":"orange"
        });
        
		this.on("select", function(emitter, event){
			emitter.onClick(emitter, event)
		});

		this.on("removed", function(emitter, event){
			canvas.onClick(null, null)
        });
    },
    onClick:function(emitter, event){
        clearProperty();
        document.getElementById("property-title").innerHTML = "comment";
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
    setPanelParameter:function(){
        document.getElementById("property-footer").appendChild(htmlToElement(footcomment));
        document.getElementById("property-body").appendChild(htmlToElement(bodycomment));
        document.getElementById("comment").value = this.getUserData()["comment"];
        var hgt = document.body.clientHeight - 180;
        document.getElementById('comment').style.height = hgt + "px";
        document.getElementById("save").onclick = save_parametercomment;
        document.getElementById("colorcomment").value = this.getUserData()["color"];
    },
    changePath:function(){
        this.setText(this.getUserData()["comment"]);
        this.setBackgroundColor(colorcomment[this.getUserData()["color"]][0]);
        this.setFontColor(colorcomment[this.getUserData()["color"]][1]);
        this.setPadding(10);
    }
});

getClass["comment"] = NodeComment;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-comment" onclick="addNode(canvas, new NodeComment(\'Comment\'));" title="comment"></div></a>')
);


function save_parametercomment(){
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "comment": document.getElementById("comment").value,
        "color": document.getElementById("colorcomment").value
    });
    canvas.getFigure(document.getElementById("property-id").value).changePath();
    saveFlow();
}

