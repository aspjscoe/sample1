ViewPort.prototype.DrawLabel2D = function (a, b, c, d) {
    var e = b / d.Size.Width; f = d.FontSize ? d.FontSize * e : 14 * e;
    this.DrawRectangle(a, b, c, d);
    this.DrawingContext.fillStyle = this.GetColorStyle(d.Color);
    var family = d.FontFamily ? d.FontFamily : "Times New Roman";
    var weight = d.FontWeight ? d.FontWeight + " " : "";
    this.DrawingContext.font = weight + f + "px " + family;
    var wrapcount = 0;
    if (d.TextDoc) {
        for (var i = 0; i < d.TextDoc.children.length; i++) {
            var line = d.TextDoc.children[i];
            var x = a.x;
            var y = a.y + ((i+wrapcount) * (e * 20)) + f; 
            for (var j = 0; j < line.children.length; j++) {
                var span = line.children[j];
                var text = span.getAttribute("text");
                switch (span.getAttribute("type")) {
                    case "openTag":
                        this.DrawingContext.fillStyle = "white";
                        if (!text) {
                            text = "<";
                        }
                        break;
                    case "openTagEnd":
                        this.DrawingContext.fillStyle = "white";
                        text = ">";
                        break;
                    case "closeTag":
                        this.DrawingContext.fillStyle = "white";
                        if (!text) {
                            text = "</";
                        }
                        break;
                    case "tagName":
                        this.DrawingContext.fillStyle = "#f92672";
                        break;
                    case "attributeName":
                        this.DrawingContext.fillStyle = "#a6e22e";
                        text = " " + text + "=";
                        break;
                    case "attributeValue":
                        this.DrawingContext.fillStyle = "#e6db74";
                        text = "\"" + text + "\"";
                        break;
                    case "attributeValueFirst":
                        this.DrawingContext.fillStyle = "#e6db74";
                        text = "\"" + text + ";";
                        break;
                    case "attributeValueNext":
                        this.DrawingContext.fillStyle = "#e6db74";
                        text = text + ";";
                        break;
                    case "attributeValueLast":
                        this.DrawingContext.fillStyle = "#e6db74";
                        text = text + "\"";
                        break;
                    case "innerText":
                        this.DrawingContext.fillStyle = "white";
                        break;
                }
                var sublines = [];
                var textWidth = this.DrawingContext.measureText(text).width;
                if(x+textWidth>=683)
                {
                    var newstr = text;
                    var text1 = text;
                    while (newstr.length > 0) {                        
                        while (x + textWidth >= 683) {
                            var index = newstr.lastIndexOf(" ");
                            newstr = newstr.substring(0, index);
                            textWidth = this.DrawingContext.measureText(newstr).width; 
                        }  
                        sublines.push(newstr);     
                        text1  = text1.replace(newstr, "");             
                        newstr = text1;
                        textWidth = this.DrawingContext.measureText(newstr).width;
                    }
                    var y1 = y;
                    this.DrawingContext.fillText(sublines[0], x, y1);
                    var space = "";
                    for(var k=1;k<sublines[0].length;k++){
                      if(sublines[0][k]==' '){
                        space+=" ";
                      }
                      else{
                          break;
                      }
                    }
                    for(var k=1;k<sublines.length;k++){   
                       wrapcount++;
                       y1 = a.y + ((i+wrapcount) * (e * 20)) + f;                    
                       this.DrawingContext.fillText(space+sublines[k], x, y1);
                    } 
                    x += textWidth;                  
                }
                else{
                    this.DrawingContext.fillText(text, x, y);
                    x += textWidth;
                }
                
                
            }

        }
    }
    else {
        var g = d.Text;
        var x = a.x;
        var y = a.y + f;
        this.DrawingContext.fillText(g, x, y);
        
        if(d.TextStrikeOut){
          var w= this.DrawingContext.measureText(g).width;
          this.DrawingContext.moveTo(x,y-(f/4));
          this.DrawingContext.lineTo(x+w,y-(f/4));
          this.DrawingContext.lineWidth = 1;
          this.DrawingContext.strokeStyle = this.GetColorStyle(d.Color);
          this.DrawingContext.stroke();
        }
        if(d.TextUnderline){
          var w= this.DrawingContext.measureText(g).width;
          this.DrawingContext.moveTo(x,y+3);
          this.DrawingContext.lineTo(x+w,y+3);
          this.DrawingContext.lineWidth = 1;
          this.DrawingContext.strokeStyle = this.GetColorStyle(d.Color);
          this.DrawingContext.stroke();
        }
    }
}
// Label2D.prototype.LoadFromElement = function (a) {
//     if (null != a)
//         this.TextDoc = a.children[0];
//     console.log(this.TextDoc);
// }
function DocWritter(doc, label2D, game) {
    var lineindex = 0;
    var spanIndex = 0;
    var count = 0;
    var spanStartIndex = 0;
    var spanEndIndex = 0;
    var eventHandler = new EventHandler(this);
    eventHandler.createEvent("elementWritten");
    eventHandler.createEvent("attributeWritten");
    eventHandler.createEvent('contentWritten');
    eventHandler.createEvent("completed");
    function written(element) {
        if (element.children.length > 0) {
            var child = element.children[0];
            recursive(child, label2D);
            return;
        }
        var parent = element.parentElement;
        if (parent != null) {
            count--;
            parent.removeChild(element);
            written(parent);
            return;
        }
        eventHandler.raiseEvent("completed", null);
    }
    function recursive(element, label2D) {
        WriteElement(element, label2D, function () {
            count++;
            written(element);
        });
    }
    this.startWriting = function () {
        recursive(doc, label2D);
    }
    
    function identify(element){       
        var str = element.innerHTML;
        for(var i=0;i<element.children.length;i++){
             var html = element.children[i].outerHTML;
             str = str.replace(html,"");
        }
        if(str && str.trim()!=="")
        {
            return true;
        }
        return false;
    }
    function addOpenTagSpans(tagName,line,allign){        
        var space = "";
        if (allign) {
            for (j = 0; j < count; j++) {
                space += "    ";
            }
        }
        var span1 = document.createElement("span");
        span1.setAttribute("Type", "openTag");
        span1.setAttribute("Text", space + "<");
        var span2 = document.createElement("span");
        span2.setAttribute("Type", "tagName");
        span2.setAttribute("Text", tagName);
        var span3 = document.createElement("span");
        span3.setAttribute("Type", "openTagEnd");
        if (line.push) {
            line.push(span1);
            line.push(span2);
            line.push(span3);
        }
        else {
            line.appendChild(span1);
            line.appendChild(span2);
            line.appendChild(span3);
        }       
    }
    function addCloseTagSpans(tagName,line,allign){
        var space = "";
        if (allign) {
            for (j = 0; j < count; j++) {
                space += "    ";
            }
        }
        var span11 = document.createElement("span");
        span11.setAttribute("Type", "closeTag");
        span11.setAttribute("Text", space + "</");
        var span21 = document.createElement("span");
        span21.setAttribute("Type", "tagName");
        span21.setAttribute("Text", tagName);
        var span31 = document.createElement("span");
        span31.setAttribute("Type", "openTagEnd");
        if (line.push) {
            line.push(span11);
            line.push(span21);
            line.push(span31);
        }
        else {           
            line.appendChild(span11);
            line.appendChild(span21);
            line.appendChild(span31);
        }               
    }
    function addInnerTextSpan(line,text) {
        var textspan = document.createElement("span");
        textspan.setAttribute("Type", "innerText");
        textspan.setAttribute("text", text);
        if (line.push) {
            line.push(textspan);
        }
        else{
            line.appendChild(textspan);
        }
    }

    function WriteElement(element, label2D, callback1) {
        var lines = [];  
        var line1 = [];
        var line2 = [];
        addOpenTagSpans(element.tagName.toLowerCase(),line1,true);
        lines.push(line1);  
        addCloseTagSpans(element.tagName.toLowerCase(),line2,true);        
        lines.push(line2);
        spanIndex = 0;
        lineindex = 0;
        write(lines, label2D, function () {
            eventHandler.raiseEvent("elementWritten", element)
            var isTextThere = identify(element);
            if (isTextThere) {
                startWritingContent(element,line1,lines, function () {
                    if (element.attributes.length > 0) {
                        startWritingAttributes(element, line1, lines, true, callback1);
                    }
                    else {
                        callback1();
                    }
                });
            }
            else {
                if (element.attributes.length > 0) {
                    startWritingAttributes(element, line1, lines, false, callback1);
                }
                else {
                    callback1();
                }
            }
        });
    }
    var currentLine = [];
    var currentLineindex = 0;
    function increaseIndex(lines) {
        spanIndex++;
        if (spanIndex >= lines[lineindex].length) {
            spanIndex = 0;
            lineindex++;
        }
    }
    function getTagName(tagName){
        tagName = tagName.replace("<","");
        tagName = tagName.replace(">","");
        tagName = tagName.replace("/","");
        tagName = tagName.trim();
        return tagName;
    }
    function startWritingContent(element, line1, lines, callback1) {        
        var space = "";
        for (j = 0; j < count; j++) {
            space += "    ";
        }
        var text = element.innerHTML.trim();
        text = space + text;
        var textLine = document.createElement("line");
        var line = [];
        var previousTag = "";
        while(text.length>0){
             var sindex=text.indexOf("<");
             var eindex=text.indexOf(">");
             if(sindex!=-1&&eindex!=-1){
                 var tagName = text.substring(sindex,eindex+1);
                 var strs = text.split(tagName);                
                 text = strs[1];                
                 if(strs[0]!=""){
                  addInnerTextSpan(line,strs[0]);
                 }
                 if(tagName!=""){
                     if(tagName.indexOf("/")!=-1){                       
                       addCloseTagSpans(getTagName(tagName),line,false);
                     }
                     else{
                        addOpenTagSpans(getTagName(tagName),line,false);
                     }                  
                 }
             }
             else {                 
                 addInnerTextSpan(line,text);  
                 text="";               
             }
        }
        currentLine.push(textLine);
        var length = label2D.TextDoc.children.length;
        var ref = label2D.TextDoc.children[length - count - 1];
        label2D.TextDoc.insertBefore(textLine, ref);
        game.Geoport.Refresh();
        while(element.children.length > 0)
        {
            element.removeChild(element.children[0]);
        }
        writeContentCounter=0;
        writeContent(line,textLine,callback1);        
    }
    function startWritingAttributes(element,line1,lines,textThere,callback1){
        spanStartIndex = line1.length - 1;
                for (var i = 0; i < element.attributes.length; i++) {
                    var span111 = document.createElement("span");
                    span111.setAttribute("Type", "attributeName");
                    span111.setAttribute("text", element.attributes[i].name);
                    line1.splice(line1.length - 1, 0, span111);
                    var avalue = element.attributes[i].value;
                    var allvals = avalue.split(";");
                    if (allvals.length > 1) {
                        for (z = 0; z < allvals.length; z++) {
                            var type = "attributeValue";
                            if (z == 0) {
                                type = "attributeValueFirst";
                            }
                            else if (z == allvals.length - 1) {
                                type = "attributeValueLast";
                            }
                            else {
                                type = "attributeValueNext";
                            }
                            var spanz = document.createElement("span");
                            spanz.setAttribute("Type", type);
                            spanz.setAttribute("text", allvals[z]);
                            line1.splice(line1.length - 1, 0, spanz);
                        }
                    }
                    else {
                        var span211 = document.createElement("span");
                        span211.setAttribute("Type", "attributeValue");
                        span211.setAttribute("text", element.attributes[i].value);
                        line1.splice(line1.length - 1, 0, span211);
                    }
                }
                spanEndIndex = line1.length - 1;
                var length = label2D.TextDoc.children.length;
                if (textThere) {
                    writeAttributes(label2D.TextDoc.children[length - count - 3], lines, callback1);
                }
                else {
                    writeAttributes(label2D.TextDoc.children[length - count - 2], lines, callback1);
                }
    }
    function writeAttributes(element, lines, callback1) {
        if (spanStartIndex < spanEndIndex) {
            var index = element.children.length - 1;
            element.insertBefore(lines[0][spanStartIndex], element.children[index]);
            game.Geoport.Refresh();
            eventHandler.raiseEvent("attributeWritten", lines[0][spanStartIndex]);
            spanStartIndex++;
            setTimeout(function () {
                writeAttributes(element, lines, callback1);
            }, 500);
        }
        else {
            callback1();
        }
    }
    var writeContentCounter = 0; 
    function writeContent(line, textline, callback1){
         if (writeContentCounter < line.length) {            
            textline.appendChild(line[writeContentCounter]);
            game.Geoport.Refresh();
            eventHandler.raiseEvent("contentWritten", line[writeContentCounter]);
            writeContentCounter++;
            setTimeout(function () {
                writeContent(line, textline, callback1);
            }, 500);
        }
        else {
            callback1();
        }
    }
    function write(lines, label2D, callback) {
        if (spanIndex == 0 && lineindex < lines.length) {
            var ele = document.createElement("line");
            if (count == 0) {
                label2D.TextDoc.appendChild(ele);
                currentLineindex = label2D.TextDoc.children.length - 1;

            }
            else {
                var last = label2D.TextDoc.children[label2D.TextDoc.children.length - count]
                currentLineindex = label2D.TextDoc.children.length - count;
                label2D.TextDoc.insertBefore(ele, last);

                //currentLine.splice(currentLine.length-count,0,ele);
            }
            currentLine.push(ele);
            label2D.TextDoc.children[currentLineindex].appendChild(lines[lineindex][spanIndex]);
            //currentLine[currentLineindex].appendChild(lines[lineindex][spanIndex]);
            game.Geoport.Refresh();
            increaseIndex(lines);
            setTimeout(function () {
                write(lines, label2D, callback);
            }, 500);
        }
        else if (spanIndex > 0 && lineindex < lines.length) {
            label2D.TextDoc.children[currentLineindex].appendChild(lines[lineindex][spanIndex]);
            game.Geoport.Refresh();
            increaseIndex(lines);
            setTimeout(function () {
                write(lines, label2D, callback);
            }, 500);
        }
        else if (lineindex >= lines.length) {
            callback();
        }
    }
}

