



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
	//HuffmanNode
	var tree=[];
        var codetree=[];
			var codemask=[];
        //HuffmanCode
		var codes=[];
        var max_symbols = 0x100;
        var num_leafs, num_nodes;
        var freqs=[];
        var num_bits;	
	
		function stringToByteArray(string){
			var arr=[];
			var counter=0;
			for(var i=0;i<string.length;i+=2){
				arr[counter]=parseInt("0x"+string.substring(i,i+2));
				counter++;
			}
			return arr;
			
		}

		function compressArrayDownload(sggtring,fileName){
		var nac=stringToByteArray(sggtring);
	//	console.log(nac);
	   var startJava=copyOf(nac, 0xC0);
            var headerJava=getCompressedHeader(nac, nac.length - 0xC0);
            var n=nac.slice(0xC0);
			
//            console.log("data length "+n.length);
            var data=[];
            for(var i=0;i<n.length;i++){
                if(n[i]<0){
                    data[i]=(n[i] & 0xFF);
                }
                else{
                    data[i]=n[i];
                }
            }
            var pk4_pos = 0;
            num_bits = 8;
            var raw_len =data.length;

            var pbuf = [];
            //byte[] aux=Arrays.copyOf(DataView.getBytes(((CMD_CODE) | (raw_len << 8))),4);
        //System.arraycopy(cc,0, pbuf, 0, 4);
		/*var by=toBytes(((CMD_CODE) | (raw_len << 8)));
		
		
				for(var i=0;i<4;i++){
					pbuf[i]=by[i];
					
				}*/
				copyArray(toBytes(((CMD_CODE) | (raw_len << 8))),0,pbuf,0,4);
				
					
				
            //Array.Copy(BitConverter.GetBytes((CMD_CODE) | (raw_len << 8)), pbuf, 4);
            var pak_pos = 4;
            var raw_pos = 0;
            HUF_InitFreqs();
            
            HUF_CreateFreqs(data, data.length);

            HUF_InitTree();
            HUF_CreateTree();

            HUF_InitCodeTree();
            HUF_CreateCodeTree();
            /*int[] aux=byteToInt(codetree);
            System.out.println("aux-----");
            
            for(int i=0;i<aux.length;i++){
                System.out.println(aux[i]+"");
            }
            System.out.println("-----aux");
            */
            HUF_InitCodeWorks();
            HUF_CreateCodeWorks();

            var cod_pos = 0;
            var clen=codetree[cod_pos];
           if(clen<0){
               clen=clen & 0xff;
           }
            var len = ((clen+1) << 1);
           
            //System.out.println("LEN "+len);
            while (len-- != 0) 
                pbuf[pak_pos++] = 
                        codetree[cod_pos++];
            var mask4 = 0;
            while (raw_pos < data.length)
            {
              
                var ch = data[raw_pos++];
                if(ch<0){
                    ch=ch & 0xff;
                }
                //System.out.println(raw_pos+"/"+data.length);

                var nbits;
                for (nbits = 8; nbits != 0; nbits -= num_bits)
                {
                    //HuffmanCode THIS IS
					code = codes[ch & ((1 << num_bits) - 1)];
                    ////  code = codes[ch >> (8 - num_bits)];

                    len = code.nbits;
                    //System.out.println(len+" lenas 1");
                    
                    //if(len<0){
                    //    len=len & 0xFF;
                    //}
                    //System.out.println(len+" lenas 2");
                    
                    var cwork = 0;

                    //byte mask = HUF_MASK;
                    var mask = Math.abs(HUF_MASK);
                    while (len-- != 0)
                    {
                        if ((mask4 >>>= Math.abs(HUF_SHIFT)) == 0)
                        {
                            mask4 = Math.abs(HUF_MASK4);
                            pk4_pos = pak_pos;
                            copyArray(toBytes(0), 0, pbuf,pk4_pos, 4);
                            //Array.Copy(BitConverter.GetBytes(0), 0, pbuf, pk4_pos, 4);
                            pak_pos += 4;
                        }
                        var codeworkInt=code.codework[cwork];
                        if(codeworkInt<0){
                            codeworkInt=codeworkInt & 0xff;
                        }
                        if((codeworkInt & mask) > 255){
                           console.log("Greater than -- "+(codeworkInt & mask));
						   
                        }
                        if ((codeworkInt & mask) != 0) 
							
                            copyArray(toBytes((toUint32(pbuf,pk4_pos) | mask4)),0,pbuf,pk4_pos,4);
                            //Array.Copy(BitConverter.GetBytes(BitConverter.ToUInt32(pbuf, pk4_pos) | mask4), 0, pbuf, pk4_pos, 4);
                        if ((mask >>>= Math.abs(HUF_SHIFT)) == 0)
                        {
                            mask = Math.abs(HUF_MASK);
                            cwork++;
                        }
                    }

                    ch >>>= num_bits;
                    ////  ch = (ch << num_bits) & 0xFF;
                }
            }


            var pak_len = (pak_pos);
//            console.log("Done");
			
			var ended=copyOf(pbuf,pak_len);
			
			var fullCompressed=startJava.concat(headerJava).concat(ended);
			ACTUAL_COMPRESSED_ARRAY=fullCompressed;
			if(fileName){
				
			downloadCompressedChapter("Compressed_"+fileName+"_"+new Date().getTime());
				
			}
			else{
				
				downloadCompressedChapter("Compressed_Chapter_"+new Date().getTime());
			
				
			}
			var hexBig="";
for(var i=0;i<ended.length;i++){
	var hex=ended[i].toString(16);
	if(hex.length==1){
		hex="0"+hex;
	}
	hexBig=hexBig+hex;
}

//processUnits(hexBig.toUpperCase());

	return ended;
            //return ;//copyOf(pbuf,(pak_len));
        }
		
		
		
		function compressArrayString(sggtring){
		var nac=stringToByteArray(sggtring);
	//	console.log(nac);
	   var startJava=copyOf(nac, 0xC0);
            var headerJava=getCompressedHeader(nac, nac.length - 0xC0);
            var n=nac.slice(0xC0);
			
//            console.log("data length "+n.length);
            var data=[];
            for(var i=0;i<n.length;i++){
                if(n[i]<0){
                    data[i]=(n[i] & 0xFF);
                }
                else{
                    data[i]=n[i];
                }
            }
            var pk4_pos = 0;
            num_bits = 8;
            var raw_len =data.length;

            var pbuf = [];
            //byte[] aux=Arrays.copyOf(DataView.getBytes(((CMD_CODE) | (raw_len << 8))),4);
        //System.arraycopy(cc,0, pbuf, 0, 4);
		/*var by=toBytes(((CMD_CODE) | (raw_len << 8)));
		
		
				for(var i=0;i<4;i++){
					pbuf[i]=by[i];
					
				}*/
				copyArray(toBytes(((CMD_CODE) | (raw_len << 8))),0,pbuf,0,4);
				
					
				
            //Array.Copy(BitConverter.GetBytes((CMD_CODE) | (raw_len << 8)), pbuf, 4);
            var pak_pos = 4;
            var raw_pos = 0;
            HUF_InitFreqs();
            
            HUF_CreateFreqs(data, data.length);

            HUF_InitTree();
            HUF_CreateTree();

            HUF_InitCodeTree();
            HUF_CreateCodeTree();
            /*int[] aux=byteToInt(codetree);
            System.out.println("aux-----");
            
            for(int i=0;i<aux.length;i++){
                System.out.println(aux[i]+"");
            }
            System.out.println("-----aux");
            */
            HUF_InitCodeWorks();
            HUF_CreateCodeWorks();

            var cod_pos = 0;
            var clen=codetree[cod_pos];
           if(clen<0){
               clen=clen & 0xff;
           }
            var len = ((clen+1) << 1);
           
            //System.out.println("LEN "+len);
            while (len-- != 0) 
                pbuf[pak_pos++] = 
                        codetree[cod_pos++];
            var mask4 = 0;
            while (raw_pos < data.length)
            {
              
                var ch = data[raw_pos++];
                if(ch<0){
                    ch=ch & 0xff;
                }
                //System.out.println(raw_pos+"/"+data.length);

                var nbits;
                for (nbits = 8; nbits != 0; nbits -= num_bits)
                {
                    //HuffmanCode THIS IS
					code = codes[ch & ((1 << num_bits) - 1)];
                    ////  code = codes[ch >> (8 - num_bits)];

                    len = code.nbits;
                    //System.out.println(len+" lenas 1");
                    
                    //if(len<0){
                    //    len=len & 0xFF;
                    //}
                    //System.out.println(len+" lenas 2");
                    
                    var cwork = 0;

                    //byte mask = HUF_MASK;
                    var mask = Math.abs(HUF_MASK);
                    while (len-- != 0)
                    {
                        if ((mask4 >>>= Math.abs(HUF_SHIFT)) == 0)
                        {
                            mask4 = Math.abs(HUF_MASK4);
                            pk4_pos = pak_pos;
                            copyArray(toBytes(0), 0, pbuf,pk4_pos, 4);
                            //Array.Copy(BitConverter.GetBytes(0), 0, pbuf, pk4_pos, 4);
                            pak_pos += 4;
                        }
                        var codeworkInt=code.codework[cwork];
                        if(codeworkInt<0){
                            codeworkInt=codeworkInt & 0xff;
                        }
                        if((codeworkInt & mask) > 255){
                           console.log("Greater than -- "+(codeworkInt & mask));
						   
                        }
                        if ((codeworkInt & mask) != 0) 
							
                            copyArray(toBytes((toUint32(pbuf,pk4_pos) | mask4)),0,pbuf,pk4_pos,4);
                            //Array.Copy(BitConverter.GetBytes(BitConverter.ToUInt32(pbuf, pk4_pos) | mask4), 0, pbuf, pk4_pos, 4);
                        if ((mask >>>= Math.abs(HUF_SHIFT)) == 0)
                        {
                            mask = Math.abs(HUF_MASK);
                            cwork++;
                        }
                    }

                    ch >>>= num_bits;
                    ////  ch = (ch << num_bits) & 0xFF;
                }
            }


            var pak_len = (pak_pos);
//            console.log("Done");
			
			var ended=copyOf(pbuf,pak_len);
			
			var fullCompressed=startJava.concat(headerJava).concat(ended);
			ACTUAL_COMPRESSED_ARRAY=fullCompressed;
			
			var hexBig="";
for(var i=0;i<ACTUAL_COMPRESSED_ARRAY.length;i++){
	var hex=ACTUAL_COMPRESSED_ARRAY[i].toString(16);
	if(hex.length==1){
		hex="0"+hex;
	}
	hexBig=hexBig+hex;
}

//processUnits(hexBig.toUpperCase());

	return hexBig.toUpperCase();
            //return ;//copyOf(pbuf,(pak_len));
        }
		function copyOf(arr,length){
			var nuevo=[];
			for(var i=0;i<length;i++){
				if(typeof(arr[i])!="undefined" && arr[i]!=null){
					
					nuevo[i]=arr[i];
					
				}
				else nuevo[i]=0;
				
				
			}
			return nuevo;
			
		}
		function copyArray(arrStart,offsetStart,arrDest,offsetDest,copyLength){
		//var by=toBytes(((CMD_CODE) | (raw_len << 8)));
		
		
				for(var i=0;i<copyLength;i++){
					arrDest[i+offsetDest]=arrStart[i+offsetStart];
					
				}
		}
		
		function toBytes(num) {
   var arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    var view = new DataView(arr);
    view.setUint32(0, num, false);


	// byteOffset = 0; litteEndian = false
    return Array.from(new Uint8Array(arr)).reverse();
}
function toUint32(arreglo,offset){
	 var value = byteAsULong(arreglo[0+offset]) | (byteAsULong(arreglo[1+offset]) << 8) | (byteAsULong(arreglo[2+offset]) << 16) | (byteAsULong(arreglo[3+offset]) << 24);
    //System.out.println("arreglo 0 "+ byteAsULong(arreglo[0+offset]));
    //System.out.println("arreglo 1 "+ byteAsULong(arreglo[1+offset]));
    //System.out.println("arreglo 2 "+ byteAsULong(arreglo[2+offset]));
    //System.out.println("arreglo 3 "+ byteAsULong(arreglo[3+offset]));
    
    return value;
}
function byteAsULong(b) {
            return (b) & (0x00000000000000FF); 
        }
function toUint16(arreglo,offset){
	
var value = byteAsULong(arreglo[0+offset]) | (byteAsULong(arreglo[1+offset]) << 8);
   
    
    return value;
}
       function HUF_InitFreqs()
        {
            

            freqs = [];

            for (var i = 0; i < max_symbols; i++) freqs[i] = 0;
			
//			console.log(freqs);
        }
        
        function HUF_CreateFreqs(raw_buffer, raw_len)
        {
            //uint i;
		/*	var str="";
			console.log(raw_buffer.length);
			for(var i=0;i<raw_buffer.length;i++){
				
				str=str+raw_buffer[i]+",";
				
			}*/
			
			
			//console.log("Raw buffer: ",str);

            for (var i = 0; i < raw_len; i++)
            {
                var ch = raw_buffer[i];
                if(ch<0){
                    ch=ch & 0xFF;
                }
                                   // System.out.println(ch+" ch");
                var nbits;
                for (nbits = 8; nbits != 0; nbits -= num_bits)
                {
                    var val=(ch >>>(8 - num_bits));
                    //val=Math.abs(val);
                    //System.out.println(val);
                    freqs[val]++;
                    ch = (ch << num_bits) & 0xFF;
                    //ch=Math.abs(ch);
                }
            }

            num_leafs = 0;
            for (var i = 0; i < max_symbols; i++) if (freqs[i] != 0) num_leafs++;
            if (num_leafs < 2)
            {
                if (num_leafs == 1)
                {
                    for (var i = 0; i < max_symbols; i++)
                    {
                        if (freqs[i] != 0)
                        {
                            freqs[i] = 1;
                            break;
                        }
                    }
                }
                while (num_leafs++ < 2)
                {
                    for (var i = 0; i < max_symbols; i++)
                    {
                        if (freqs[i] == 0)
                        {
                            freqs[i] = 2;
                            break;
                        }
                    }
                }
            }
            num_nodes = (num_leafs << 1) - 1;
        }
		function HuffmanNode(){
			this.symbol=null;
            this.weight=null;
            this.leafs=null;

            this.dad=null;
            this.lson=null;
            this.rson=null;
			
			
		}
		function HuffmanCode()
        {
            this.nbits=null;
            this.codework=null;
        }
        function HUF_InitTree()
        {
            tree = [];
            var i;
            for (i = 0; i < num_nodes; i++) tree[i] = null;
        }
        function HUF_CreateTree()
        {
            

            var num_node = 0;
            for (var i = 0; i < max_symbols; i++)
            {
                if (freqs[i] != 0)
                {
                    var node = new HuffmanNode();
                    

                    node.symbol = i;
                    node.weight = freqs[i];
                    node.leafs = 1;
                    node.dad = null;
                    node.lson = null;
                    node.rson = null;
					tree[num_node++] = node;
					
                }
            }

//console.log("NUMNODE",num_node,"NODES",num_nodes);
            while (num_node < num_nodes)
            {
                var rnode;
                var lnode = rnode = null;
                var rweight;
                var lweight = rweight = 0;

                for (var i = 0; i < num_node; i++)
                {
//					console.log(tree[i]);
                    if (tree[i].dad == null)
                    {
                        if (lweight == 0 || (tree[i].weight < lweight))
                        {
                            rweight = lweight;
                            rnode = lnode;
                            lweight = tree[i].weight;
                            lnode = tree[i];
                        }
                        else if (rweight == 0 || (tree[i].weight < rweight))
                        {
                            rweight = tree[i].weight;
                            rnode = tree[i];
                        }
                    }
                }

                var node = new HuffmanNode();
                tree[num_node++] = node;

                node.symbol = num_node - num_leafs + max_symbols;
                
				
				node.weight = lnode.weight + rnode.weight;
                
				
				node.leafs = lnode.leafs + rnode.leafs;
				
				
                node.dad = null;
                node.lson = lnode;
                node.rson = rnode;

                lnode.dad = rnode.dad = node;
            }
        }
        function HUF_InitCodeTree()
        {
            

            var max_nodes = (((num_leafs - 1) | 1) + 1) << 1;

            codetree =[];// new byte[max_nodes];
            codemask =[]; //new byte[max_nodes];

            for (var i = 0; i < max_nodes; i++)
            {
                codetree[i] = 0;
                codemask[i] = 0;
            }
        }
        function HUF_CreateCodeTree()
        {
            var i = 0;

            codetree[i] = ((num_leafs - 1) | 1);
           
            //System.out.println(codetree[i]+" num leafs");
            codemask[i] = 0;

            HUF_CreateCodeBranch(tree[num_nodes - 1], i + 1, i + 2);
            HUF_UpdateCodeTree();
            var what=codetree[0];
            if(what<0){
                what=what&0xff;
            }
            
//            console.log("What "+what);
            
            var c=((what + 1) << 1);
            //if(c<0){
            //    c=c & 0xFF;
            //}
            i = c;
            //System.out.println("codetree "+i);
            var auxmask=byteToInt(codemask);
            var auxtree=byteToInt(codetree);
            
            while (--i != 0){
                if (auxmask[i] != 0xFF) {
                    auxtree[i] |= auxmask[i];
                
                }
            }
            codetree=intToByte(auxtree);
        }
        function HUF_CreateCodeBranch(root, p, q)
        {
            var stack = [];
            var mask;

            if (root.leafs <= HUF_NEXT + 1)
            {
                var r;
                var s = r = 0;
                stack[r++] = root;

                while (s < r)
                {
                    var node;
                    if ((node = stack[s++]).leafs == 1)
                    {
                        if (s == 1) { codetree[p] = node.symbol; codemask[p] = 0xFF; }
                        else { codetree[q] = node.symbol; codemask[q++] = 0xFF; }
                    }
                    else
                    {
                        mask = 0;
                        if (node.lson.leafs == 1) mask |= HUF_LCHAR;
                        if (node.rson.leafs == 1) mask |= HUF_RCHAR;

                        if (s == 1) { codetree[p] = ((r - s) >>> 1); codemask[p] = mask; }
                        else { codetree[q] = ((r - s) >>> 1); codemask[q++] = mask; }

                        stack[r++] = node.lson;
                        stack[r++] = node.rson;
                    }
                }
            }
            else
            {
                mask = 0;
                if (root.lson.leafs == 1) mask |= HUF_LCHAR;
                if (root.rson.leafs == 1) mask |= HUF_RCHAR;

                codetree[p] = 0; codemask[p] = mask;

                if (root.lson.leafs <= root.rson.leafs)
                {
                    var l_leafs = HUF_CreateCodeBranch(root.lson, q, q + 2);
                    var r_leafs = HUF_CreateCodeBranch(root.rson, q + 1, q + (l_leafs << 1));
                    codetree[q + 1] = (l_leafs - 1);
                }
                else
                {
                    var r_leafs = HUF_CreateCodeBranch(root.rson, q + 1, q + 2);
                    var l_leafs = HUF_CreateCodeBranch(root.lson, q, q + (r_leafs << 1));
                    codetree[q] = (r_leafs - 1);
                }
            }

            return (root.leafs);
        }
        function intToByte(n){
            var arreglo=[];
            for(var i=0;i<n.length;i++){
                
                arreglo[i]=n[i]; 
            }
            return arreglo;
        }
        function byteToInt(n){
            var arreglo=[];
            for(var i=0;i<n.length;i++){
                var c=n[i];
                if(c<0){
                    c = c & 0xff;
                }
                arreglo[i]=c; 
            }
            return arreglo;
        }
        function HUF_UpdateCodeTree()
        {
            var i;
            
            //int what=codetree[0];
            //if(what<0){
            //    what=what &0xff;
            //}
            
            
            var auxtree=byteToInt(codetree);
            var auxmask=byteToInt(codemask);
            var max = ((auxtree[0] + 1) << 1);
            
            for (i = 1; i < max; i++)
            {
                
                if ((auxmask[i] != 0xFF) && (auxtree[i] > HUF_NEXT))
                {
                    var inc;
                    if ((i & 1) != 0 && (auxtree[i - 1] == HUF_NEXT))
                    {
                        i--;
                        inc = 1;
                    }
                    else if ((i & 1) == 0 && (auxtree[i + 1] == HUF_NEXT))
                    {
                        i++;
                        inc = 1;
                    }
                    else
                    {
                        inc = auxtree[i] - Math.abs(HUF_NEXT);
                    }
                    //if(codetree[i]<0){
                    //    System.out.println("negative codetree "+codetree[i]);
                    //    codetree[i]=(codetree[i] & 0xFF);
                    //}
                    var n1 = (i >>> 1) + 1 + auxtree[i];
                    var n0 = n1 - inc;

                    var l1 = n1 << 1;
                    var l0 = n0 << 1;
                    codetree=intToByte(auxtree);
                    codemask=intToByte(auxmask);
                    
                    var tmp0 = toUint16(codetree,l1);
                    var tmp1 = toUint16(codemask,l1);
                    var j;
                    for (j = l1; j > l0; j -= 2)
                    {
                        copyArray(toBytes((toUint16(codetree,j - 2))),0,codetree,j, 2);
                        copyArray(toBytes((toUint16(codemask,j - 2))),0,codemask,j, 2);
                        
                        //Array.Copy(BitConverter.GetBytes(BitConverter.ToUInt16(codetree, j - 2)), 0, codetree, j, 2);
                        //Array.Copy(BitConverter.GetBytes(BitConverter.ToUInt16(codemask, j - 2)), 0, codemask, j, 2);
                    }
                    copyArray(toBytes(tmp0), 0, codetree, l0, 2);
                    copyArray(toBytes(tmp1), 0, codemask, l0, 2);
                    
                    //Array.Copy(BitConverter.GetBytes(tmp0), 0, codetree, l0, 2);
                    //Array.Copy(BitConverter.GetBytes(tmp1), 0, codemask, l0, 2);
                    auxtree=byteToInt(codetree);
                    auxmask=byteToInt(codemask);
                    
                    auxtree[i] -= inc;

                    var k;
                    for (j = i + 1; j < l0; j++)
                    {
                        if (auxmask[j] != 0xFF)
                        {
                            k = (j >>> 1) + 1 + auxtree[j];
                            if ((k >= n0) && (k < n1)) auxtree[j]++;
                        }
                    }

                    if ((auxmask[l0 + 0] )!= 0xFF)
                        auxtree[l0 + 0] +=inc;
                    if (auxmask[l0 + 1] != 0xFF)
                        auxtree[l0 + 1] += inc;

                    for (j = l0 + 2; j < l1 + 2; j++)
                    {
                        if (auxmask[j] != 0xFF)
                        {
                            k = (j >>> 1) + 1 + auxtree[j];
                            if (k > n1) auxtree[j]--;
                        }
                    }
                    codetree=intToByte(auxtree);
                    codemask=intToByte(auxmask);
                    
                    i = (i | 1) - 2;
                }
            }
            codetree=intToByte(auxtree);
                    codemask=intToByte(auxmask);
            
        }
        function  HUF_InitCodeWorks()
        {
            var i;
            codes = [];
            for (i = 0; i < max_symbols; i++) codes[i] = null;
			
			
        }
        function HUF_CreateCodeWorks()
        {
            var scode = []
            var i;

            for (i = 0; i < num_leafs; i++)
            {
                var node = tree[i];
                var symbol = node.symbol;

                var nbits = 0;
                while (node.dad != null)
                {
                    scode[nbits++] = node.dad.lson == node ? HUF_LNODE : HUF_RNODE;
                    node = node.dad;
                }
                var maxbytes = (nbits + 7) >>> 3;

                var code = new HuffmanCode();

                codes[symbol] = code;
                code.nbits = nbits;
                code.codework = [];

                var j;
                for (j = 0; j < maxbytes; j++) code.codework[j] = 0;
var mask = Math.abs(HUF_MASK);
                //byte mask = HUF_MASK;
                j = 0;
                var nbit;
                for (nbit = nbits; nbit != 0; nbit--)
                {
                    if (scode[nbit - 1] != 0) code.codework[j] |= mask;
                    if ((mask >>>= HUF_SHIFT) == 0)
                    {
                        mask = Math.abs(HUF_MASK);
                        j++;
                    }
                }
            }
        }
        
        
        

        
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	window.ACTUAL_DECOMPRESSED_ARRAY=[];
	
	
	
function decompressArray(res){
//	console.log(res.byteLength);
	var heador=copyOf(Array.from(new Uint8Array(res)),0XC0);
//	console.log(heador);
	var s=res.slice(0XD0);
	    
		
    /*var byteArray=getByteArrayFromString(s);
	var fullHex="";
	for(i=0;i<byteArray.length;i++){
		fullHex=fullHex+(binaryToHex(byteArray[i]).result);
	}
	console.log(fullHex);*/
	///console.log(s.byteLength+" byte length");
var u = new Uint8Array(s);

var cccccc=Array.from(u);

//	console.log("Before decompressing",cccccc);
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

var fullArray=heador.concat(array);
window.ACTUAL_DECOMPRESSED_ARRAY=fullArray;

//console.log("After compressing",compressArray(array));
var hexBig="";
for(var i=0;i<fullArray.length;i++){
	var hex=fullArray[i].toString(16);
	if(hex.length==1){
		hex="0"+hex;
	}
	hexBig=hexBig+hex;
}

//processUnits(hexBig.toUpperCase());

	return hexBig.toUpperCase();
	

}

var ACTUAL_COMPRESSED_ARRAY=[];
 function str2ab(string,callback) {
       /* var buf = new ArrayBuffer(arr.length); // 2 bytes for each char
       var bufView = new Uint8Array(buf);
       for (var i=0; i<arr.length; i++) {
         bufView[i] = arr[i];
       }
       return buf;*/
	//   var ut=new Uint8Array(stringToByteArray(string));
	//console.log(ut);
	console.log(stringToByteArray(string));
	var ut=new Uint8Array(stringToByteArray(string));
	
    var blob = new Blob([ut],{type:"application/octect-stream"});
var fileReader = new FileReader();
	   var file = new File([blob],"ChapterFile");

	
	fileReader.onload = function() {
    callback(this.result);
	
};
fileReader.readAsArrayBuffer(file);
	   
     }
function stringToArrayBuffer(string){
	var uint8Array  = new Uint8Array(stringToByteArray(string));
var arrayBuffer = uint8Array.buffer;
return arrayBuffer;
	
	/*var ut=new Uint8Array(stringToByteArray(string));
	console.log(ut);
	var arrayBuffer;
var fileReader = new FileReader();
    var blob = new Blob([ut]);
	
	fileReader.onload = function() {
    arrayBuffer = this.result;
	callback(arrayBuffer);
};
fileReader.readAsArrayBuffer(blob);
	*/
}
function downloadCompressedChapter(reportName) {
	var ut=new Uint8Array(ACTUAL_COMPRESSED_ARRAY);
	
    var blob = new Blob([ut],{type:"application/octect-stream"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
}
function downloadDecompressedChapter(reportName) {
	var arrr=stringToByteArray(window.ACTUAL_DECOMPRESSED_ARRAY);
	var ut=new Uint8Array(arrr);
	
    var blob = new Blob([ut],{type:"application/octect-stream"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    
	
	var fileName = "";
if(reportName){
	fileName="Decompressed_"+reportName+"_"+new Date().getTime();
	
}	
else{
	fileName="Decompressed_Chapter_"+new Date().getTime();
	
	
}
	
	
    link.download = fileName;
    link.click();
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
	
	
	
	
	
	
	
	
	
	
	function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
	function getHexFromLetter(letter){
        
        return getHexPair(toUTF8Array(letter)[0]);
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
 
 
 
 
function getCompressedHeader(decmp,length){
            var Header = [];
            
            copyArray([0x50,0x4D,0x4F,0x43],0, Header,0, 0x4);
            
            copyArray(toBytes(2),0, Header,0x4, 0x4);
            copyArray(toBytes(length),0, Header,0x8, 0x4);
			
//			console.log(decmp);
			var str=String.fromCharCode.apply(null, decmp);
            var checkSumBytes=toBytes(getCRC32(str));
            copyArray(checkSumBytes,0, Header,0xC, 0x4);
            //for(int i=0;i<checkSumBytes.length;i++){
            //    System.out.println("checksum "+checkSumBytes[i]);
            //}
           // CRC32 of Decompressed Data.
            return Header;
        }
		
function makeCRCTable(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

function getCRC32(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
}