var bodymail = `
<table id="mail" style="width:100%">
    <tr>
        <td><label class="siimple-label">To</label></td>
        <td><input id="to" name="to" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Cc</label></td>
        <td><input id="cc" name="cc" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Bcc</label></td>
        <td><input id="bcc" name="bcc" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Title</label></td>
        <td><input id="title" name="title" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Message</label></td>
        <td><textarea id="msg" name="msg" class="siimple-textarea siimple-input--fluid" value="" rows="5"></textarea></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Smtp Server</label></td>
        <td><input id="smtpserver" name="smtpserver" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Smtp SSL</label></td>
        <td>    
            <select id="smtpssl" name="smtpssl" class="siimple-select siimple-select--fluid">
                <option value="false">False</option>
                <option value="true">True</option>
            </select>
        </td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Smtp Port</label></td>
        <td><input id="smtpport" name="smtpport" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Smtp User</label></td>
        <td><input id="smtpuser" name="smtpuser" class="siimple-input siimple-input--fluid" value=""></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Smtp Password</label></td>
        <td><input id="smtppassword" name="smtppassword" class="siimple-input siimple-input--fluid" value="" type="password"></td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Add data</label></td>
        <td>    
            <select id="withdata" name="withdata" class="siimple-select siimple-select--fluid">
                <option value=""></option>
                <option value="csv">csv</option>
                <option value="xlsx">xlsx</option>
                <option value="json">json</option>
                <option value="xml">xml</option>
            </select>
        </td>
        <td class="minimal"></td>
    </tr>
    <tr>
        <td><label class="siimple-label">Add attachment</label></td>
        <td></td>
        <td class="minimal"><div class="siimple-btn--big icon-add siimple--float-right" onclick="add_att()"></div></td>
    </tr>
</table>
`;

var footmail = `<div></div>
`;

var att = `
<tr class="att">
    <td></td>
    <td><input class="siimple-input siimple-input--fluid" value=""</td>
    <td class="minimal"><div class="siimple-btn--big icon-del siimple--float-right" onclick="del_att(this)"></div></td>
</tr>
`;

var NodeMail = Node.extend({
    NAME: "mail",
    init:function(name){
        this._super(name=name, path="/mail/mail.png");
        this.setUserData({
            "to":"",
            "cc":"",
            "bcc":"",
            "title":"",
            "msg":"",
            "smtpserver":"",
            "smtpssl":"true",
            "smtpport":"587",
            "smtpuser":"",
            "smtppassword":"",
            "withdata":"",
            "atts":[]
        })
    },
    setPanelParameter:function(emitter, event){
        document.getElementById("property-footer").appendChild(htmlToElement(footmail));
        document.getElementById("property-body").appendChild(htmlToElement(bodymail));
        document.getElementById("to").value = this.getUserData()["to"];
        document.getElementById("cc").value = this.getUserData()["cc"];
        document.getElementById("bcc").value = this.getUserData()["bcc"];
        document.getElementById("title").value = this.getUserData()["title"];
        document.getElementById("msg").value = this.getUserData()["msg"];
        document.getElementById("smtpserver").value = this.getUserData()["smtpserver"];
        document.getElementById("smtpssl").value = this.getUserData()["smtpssl"];
        document.getElementById("smtpport").value = this.getUserData()["smtpport"];
        document.getElementById("smtpuser").value = this.getUserData()["smtpuser"];
        document.getElementById("smtppassword").value = this.getUserData()["smtppassword"];
        document.getElementById("withdata").value = this.getUserData()["withdata"];        
        this.getUserData()["atts"].forEach(function(elt){
            document.getElementById("mail").appendChild(htmlToElement(att));
            var obj = document.getElementById("mail").querySelectorAll("tr.att:last-child")[0];
            obj.querySelectorAll("input")[0].value = elt;
        })
        document.getElementById("save").onclick = save_parametermail;
    }
});

getClass["mail"] = NodeMail;

document.getElementById("toolbar_node").appendChild(
    htmlToElement('<a class="siimple-menu-item"><div class="siimple-btn--big icon-mail" onclick="addNode(canvas, new NodeMail(\'mail\'));" title="mail"></div></a>')
);


function save_parametermail(){
    var atts = []
    Array.from(document.getElementById("mail").querySelectorAll("tr.att")).forEach(function(obj){
        atts.push(obj.querySelectorAll("input")[0].value)
    });
    canvas.getFigure(document.getElementById("property-id").value).setUserData({
        "title": document.getElementById("title").value,
        "to": document.getElementById("to").value,
        "cc": document.getElementById("cc").value,
        "bcc": document.getElementById("bcc").value,
        "msg": document.getElementById("msg").value,
        "smtpserver": document.getElementById("smtpserver").value,
        "smtpssl": document.getElementById("smtpssl").value,
        "smtpport": document.getElementById("smtpport").value,
        "smtpuser": document.getElementById("smtpuser").value,
        "smtppassword": document.getElementById("smtppassword").value,
        "withdata": document.getElementById("withdata").value,
        "atts": atts
    });
    saveFlow();
}



function add_att(){
    document.getElementById("mail").appendChild(htmlToElement(att));
    Array.from(document.getElementById("mail").querySelectorAll("tr:last-child input")).forEach(function(obj){
        obj.addEventListener("keydown", tosave);
    });
    tosave()
}

function del_att(obj){
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode)
    tosave()
}
