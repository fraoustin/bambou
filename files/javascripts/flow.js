String.prototype.withoutAccentLower = function(){
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
     
    var str = this;
    for(var i = 0; i < accent.length; i++){
        str = str.replace(accent[i], noaccent[i]);
    }
    str = str.toLowerCase()
    return str;
}

function download_data(data, filename, typ) {
    var dataFile;
    var downloadLink;
    // CSV FILE
    dataFile = new Blob([data], {type: typ});
    // Download link
    downloadLink = document.createElement("a");
    // File name
    downloadLink.download = filename;
    // We have to create a link to the file
    downloadLink.href = window.URL.createObjectURL(dataFile);
    // Make sure that the link is not displayed
    downloadLink.style.display = "none";
    // Add the link to your DOM
    document.body.appendChild(downloadLink);
    // Lanzamos
    downloadLink.click();
}

function export_table_to_csv(id, filename) {
	var csv = [];
    var rows = document.getElementById(id).querySelectorAll(".siimple-table-row:not(.hidden)");
    //header
    var row = [], cols = rows[0].querySelectorAll(".siimple-table-cell");
    for (var j = 0; j < cols.length; j++) 
        row.push(cols[j].innerText.toLowerCase());
    csv.push(row.join(";"));
    //body	
    for (var i = 1; i < rows.length; i++) {
		var row = [], cols = rows[i].querySelectorAll(".siimple-table-cell");
        for (var j = 0; j < cols.length; j++) 
            row.push(cols[j].innerText);
		csv.push(row.join(";"));		
	}
    // Download CSV
    download_data(csv.join("\n"), filename, "text/csv");
}

function searchAdvanced(idinput, idtable) {
    var searchvalue = document.getElementById(idinput).value.withoutAccentLower();
    var rows = document.getElementById(idtable).querySelectorAll(".siimple-table-body .siimple-table-row");
    if (searchvalue.indexOf(':') !== -1) {
        key = searchvalue.split(':')[0]
        value = searchvalue.split(':')[1]
        pos=0;
        var thead = document.getElementById(idtable).querySelectorAll(".siimple-table-header .siimple-table-cell");
        for (var i = 0; i < thead.length; i++) {
            if (thead[i].textContent == key){
                pos = i;
            }
        }
        for (var i = 0; i < rows.length; i++) {
            testText = rows[i].querySelectorAll(".siimple-table-cell")[pos].textContent.withoutAccentLower();
            if (testText.includes(value)) {
                rows[i].classList.remove("hidden")
            } else {
                rows[i].classList.add("hidden")
            }	
        }
    } else {
        for (var i = 0; i < rows.length; i++) {
            var cols = rows[i].querySelectorAll(".siimple-table-cell");
            var found = false;
            for (var j = 0; j < cols.length; j++) {
                testText = cols[j].textContent.withoutAccentLower();
                if (testText.includes(searchvalue)) {
                    found = true
                }
            };
            if (found) {
                rows[i].classList.remove("hidden")
            } else {
                rows[i].classList.add("hidden")
            }	
        }
    }
}

if (document.getElementById("search")) {
document.getElementById("search").addEventListener("input", function(){searchAdvanced("search", "table")});
};



// ***************************************************** //
//                  specific flow                        //