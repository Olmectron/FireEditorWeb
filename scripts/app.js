



var CMD_CODE = 0x28; // 8-bit Huffman magic number
        var HUF_LNODE = 0;
        var HUF_RNODE = 1;

        var HUF_SHIFT = 1;
        var HUF_MASK = 0x80;
        var HUF_MASK4 = 0x80000000;

        var HUF_LCHAR = 0x80;
        var HUF_RCHAR = 0x40;
        var HUF_NEXT = 0x3F;

        // const uint RAW_MINIM = 0x0;
        // const uint RAW_MAXIM = 0xFFFFFF;

        // const uint HUF_MINIM = 0x4;
        var HUF_MAXIM = 0x1400000;
		
function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                return { valid: false };
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}
function getBinFromDec(d) {
    var b = '';

    for (var i = 0; i < 8; i++) {
        b = (d%2) + b;
        d = Math.floor(d/2);
    }

    return b;
}
function getByteArrayFromString(s) {
    var b = new Array();
    var last = s.length;

    for (var i = 0; i < last; i++) {
        var d = s.charCodeAt(i);
            b[i] = getBinFromDec(d);
        
    }
    return b;
}

function getBytesFromHex(str) { 
    var result = [];
    while (str.length >= 8) { 
        result.push(parseInt(str.substring(0, 8), 16));

        str = str.substring(8, str.length);
    }

    return result;
}

function getHexFromBytes(arr) {
    var result = "";
    var z;

    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].toString(16);

        z = 8 - str.length + 1;
        str = Array(z).join("0") + str;

        result += str;
    }

    return result;
}

function modulo(a, b) {
        return a - Math.floor(a/b)*b;
    }
    function ToUint32(x) {
        return modulo(ToInteger(x), Math.pow(2, 32));
    }
	function ToInteger(x) {
        x = Number(x);
        return x < 0 ? Math.ceil(x) : Math.floor(x);
    }
	
function decompressArray(s){
	
	
	    
		
    /*var byteArray=getByteArrayFromString(s);
	var fullHex="";
	for(i=0;i<byteArray.length;i++){
		fullHex=fullHex+(binaryToHex(byteArray[i]).result);
	}
	console.log(fullHex);*/
	///console.log(s.byteLength+" byte length");
var u = new Uint8Array(s);

	var dv = new DataView(s, 0);
	var x=dv.getUint32(0,true);
	
var header=x;
var num_bits = header & 0xF;

            var UncompressedLength = header >> 8;
			//console.log(UncompressedLength+" cccc");
            var Uncompressed=new Uint8Array(UncompressedLength);
			var pak_pos = 4;
		
			pak_pos = pak_pos + ((u[pak_pos] + 1) << 1);
			
			
			
			var raw_pos = 0;
            var tree_ofs = 4;
            var nbits = 0;
            var pos = u[tree_ofs + 1];
			
			var next = 0, mask4 = 0;
            
			var code = dv.getUint32(pak_pos,true);
			
			while (raw_pos < Uncompressed.length)
            {
			
			

                    mask4 >>>= HUF_SHIFT;
                    
                if ((mask4) == 0)
                {

			if ((pak_pos + 3) >= u.length){ break;}
                 
				 code = dv.getUint32(pak_pos,true);
			
					pak_pos += 4;
                    mask4 = (HUF_MASK4);
					
                }
                          
						  

                next = next + (((pos & HUF_NEXT) + 1) << 1);
				
				var ch;
                if ((code & mask4) == 0)
                {
					
                    ch = pos & HUF_LCHAR;
					
					 pos = u[tree_ofs + next];
					 
                }
                else
                {
                    ch = pos & HUF_RCHAR;
                    pos = u[tree_ofs + next + 1];
					
                }

                if (ch != 0)
                {	
			
			Uncompressed[raw_pos] =  Uncompressed[raw_pos] | (pos << nbits);
                
				nbits = ((nbits + num_bits) & 7);
					
                    if (nbits == 0){ raw_pos++;}
					
                     pos = u[tree_ofs+1];
                    next = 0;
                }
				
				
            }
                
				
			u=null;
			a=null;
			
			
			
			
var array = Array.from(Uncompressed);
var hexBig="";
for(var i=0;i<array.length;i++){
	var hex=array[i].toString(16);
	if(hex.length==1){
		hex="0"+hex;
	}
	hexBig=hexBig+hex;
}

//processUnits(hexBig.toUpperCase());

	return hexBig.toUpperCase();
	

}

var Hex={CHARACTERS_HEADER:"54494E55",CHARACTERS_FOOTER:"FF49464552",
CHARACTERS_IDENTIFIER:"FFFF04",FFFF_IDENTIFIER:"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 F_BLOCK_STARTER:"32FFFF",
 DLC_IDENTIFIER:"FFFF00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 PMOC:"504D4F43"};

var afterTINUPos=0;
var unitCounter=0;

function processUnits(full){
         
        var start=full.indexOf(Hex.CHARACTERS_HEADER)+
                Hex.CHARACTERS_HEADER.length;
				afterTINUPos=start/2;
       
                var end=full.indexOf(Hex.CHARACTERS_FOOTER);
//                console.log("START "+start+", END "+end);
                var bloque=full.substring(start,end);
                var counter=parseInt("0x"+bloque.substring(4, 6));
				unitCounter=counter;
				
//console.log("Characters hex: ",bloque);
        return bloque;
    }
	
	
	function getUnitsPositions(unitsBlock){
	var positionList=new Array();
        for (var index = unitsBlock.indexOf(Hex.CHARACTERS_IDENTIFIER);
        index >= 0;
        index = unitsBlock.indexOf(Hex.CHARACTERS_IDENTIFIER, index + 1))
    {   
        var hocBlock=unitsBlock.substring(index-48);
        if(hocBlock.startsWith("07") && hocBlock.substring(4,6)=="00"){
            positionList.push(index-48);
        }
        
        
    }
        return positionList;
        
    }
	
	 function getUnitsHexBlocks(unitsBlock, positions){
		 
        var hexBlocks=new Array();
        for (var i=0; i<positions.length;i++) {
            var pos=positions[i];
            if(i+1<positions.length){
                var finalPos=positions[i+1];
            
                hexBlocks.push(unitsBlock.substring(pos, finalPos));
        
            }
            else{
                hexBlocks.push(unitsBlock.substring(pos));
        
            }
            
            
        }
        return hexBlocks;
    }
	
	function getFileUnits(hexBlocks, positions,EmblemUnits){
		var units=new Array();
		for(var i=0;i<hexBlocks.length;i++){
			var unit=getEmblemUnit(hexBlocks[i],positions[i],EmblemUnits);	
			if(unit){
				units.push(unit);
			}
			
		}
		return units;
		
		
		
	}
	
	function getEmblemUnit(charBlock, position, EmblemUnits){
        if(charBlock.startsWith("07") && charBlock.substring(4, 6)=="00" && charBlock.substring(48, 54)==Hex.CHARACTERS_IDENTIFIER){
            var charCode=parseInt("0x"+charBlock.substring(2,4));
            for (var i=0;i<EmblemUnits.length;i++) {
				var unit=EmblemUnits[i];
                if(charCode==unit.id){
					//console.log(charBlock);
					var u=copy(unit,charBlock,position);
					u.hexBlockChanged(charBlock);
                    return u;
                }
            }
        }
        return null;
    }
	
	function copy(obj,hexBlock,pos){

	var unit=new MyUnit();
	     unit.set("id",obj.id);
			unit.set("properName",obj.properName);
			unit.set("name",obj.name);

			unit.set("gender",obj.gender);
                
                unit.set("hairColorEditable",obj.hairColorEditable);
                unit.set("nameEditable",obj.nameEditable);
                unit.set("appearanceEditable",obj.appearanceEditable);
                unit.set("child",obj.child);
                unit.set("portraitVariable",obj.portraitVariable);
                unit.set("avatar",obj.avatar);
                unit.set("important",obj.important);
                unit.set("dlcSpotpass",obj.dlcSpotpass);
    unit.set("hexBlock",hexBlock);
	unit.set("hexPosition",pos);
	
	
	return unit;
	}
	
	
	function parseUnitsXML(xmlDoc){
		var units=new Array();
            
        var xmlNodes=xmlDoc.getElementsByTagName("unit");
		
		for(var i=0;i<xmlNodes.length;i++){
			var unit=new MyUnit();
			
			var xmlUnit=xmlNodes[i];
			unit.set("id",parseInt(xmlUnit.getAttribute("id")));
			unit.set("properName",xmlUnit.getAttribute("name"));
			unit.set("gender",xmlUnit.getAttribute("gender"));
			
			var locales=xmlUnit.getElementsByTagName("locale");
			if(locales && locales.length>0){
				for(var l=0;l<locales.length;l++){
					var loc=locales[l];
					if(loc.getAttribute("lang")=="en"){
						unit.set("name",loc.getElementsByTagName("name")[0].childNodes[0].nodeValue);
						
					}
					
					
				}
			}
			else{
				unit.set("name",unit.properName);
				
			}
	            
                
                unit.set("hairColorEditable",(xmlUnit.getElementsByTagName("hair-color-editable").length>0));
                unit.set("nameEditable",(xmlUnit.getElementsByTagName("name-editable").length>0));
                unit.set("appearanceEditable",(xmlUnit.getElementsByTagName("appearance-editable").length>0));
                unit.set("child",(xmlUnit.getElementsByTagName("child").length>0));
                unit.set("portraitVariable",(xmlUnit.getElementsByTagName("portrait-variable").length>0));
                unit.set("avatar",(xmlUnit.getElementsByTagName("avatar").length>0));
                unit.set("important",(xmlUnit.getElementsByTagName("important-unit").length>0));
                unit.set("dlcSpotpass",(xmlUnit.getElementsByTagName("dlc-spotpass").length>0));
    
	
		
           units.push(unit);	
		}
        
        return units;
    }
	
	function  trimBinaryZeroValueBytes(binary){
            var b=binary;
            while(b.startsWith("00")){
              b=b.substring(2);
            }
            while(b.endsWith("00")){
                b=b.substring(0,b.length-2);
            }
            return b;
    }
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	 
    function getHexPair(code){
        if(code<0){
            code=code & 0xff;
        }
        if(code<0x10){
            return "0"+code.toString(16).toUpperCase();
        }
        else{
            return code.toString(16).toUpperCase();
        }
    }
    function getHexString(array){
        var hex="";
        for(var i=0;i<array.length;i++){
            hex=hex+getHexPair(array[i]);
        }
        return hex;
    }
    
    function getWordFromHex(hex){
        if(hex.length%2!=0){
            
            return null;
        }
        else{
           
                var result="";
                for(var i=0;i<hex.length;i+=2){
                    var hexPair=hex.substring(i,i+2);
                    if(hexPair!=("00")){
                        var newChar=String.fromCharCode(getIntFromHex(hexPair));
                        result=result+newChar;
                    }
                }
                return result;
            
        }
    }
    function getIntFromHex(hex){
        if(!hex.startsWith("0x")){
            return parseInt("0x"+hex);
        }
        else{
            return parseInt(hex);
        }
    }
	var R={imagesPath:"./res/images"};
	
	
	
	
	
	
	
	
	
	function showToast(t, d, wideLayout,dialog,buttonText,buttonColor){
    newToast(t, d, wideLayout,dialog,buttonText,buttonColor).open();
}
function newToast(t, d, wideLayout,dialog,buttonText,buttonColor) {

var toast = document.createElement("paper-toast");

toast.text = t;

if(buttonText){
  var but=document.createElement("paper-button");
  but.style.cssText ="text-tarnsform:none; color: "+(buttonColor || "#2196F3")+";"

  but.innerHTML=buttonText;
  toast.appendChild(but);
}
    if(d!=null)
        toast.duration=d;
    if(wideLayout){
    toast.style="width: 100%;"+
        "min-width: 0;"+
        "border-radius: 0;"+
		"padding-top: 12px;"+
        "margin: 0;";
    }
    else{
        toast.style="";
    }

            toast.addEventListener("iron-overlay-closed",function(){
              if(dialog)
              dialog.removeChild(toast);
              else
                document.body.removeChild(toast);
                //console.log("Child removed");
            });
//dynamicEl.cities = this.officesCities;
if(dialog)
dialog.appendChild(toast);
else
document.body.appendChild(toast);

            return toast;
}
	
	
	
	var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" + hexVal(rgb[1]) + hexVal(rgb[2]) + hexVal(rgb[3]);
}

function hexVal(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
 }