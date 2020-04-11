function SVG(tag) {
		return document.createElementNS('http://www.w3.org/2000/svg', tag);
	}

function drawOctave(octaveNumber) {

	function whiteKey(x, keyName) {
		return $(SVG('rect')).addClass('whiteKey').attr('id', keyName).attr('x', x);
	}
	function blackKey(x, keyName) {
	    return $(SVG('rect')).addClass('blackKey').attr('id', keyName).attr('x', x);
	}

    var w = 10; // black key width
    var blackKeysOffsets = [  20-w/2, 2*20-w/2, 4*20-w/2, 5*20-w/2, 6*20-w/2 ]
    var octaveOffset = octaveNumber*20*7;
    var whiteKeyNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    var blackKeysNames = ['Cd', 'Dd', 'Fd', 'Gd', 'Ad']

    for(var i = 0; i < 7; i++) 
		$('#piano').append( whiteKey(octaveOffset + i*20, octaveNumber.toString() + whiteKeyNames[i]) );

    for(var i = 0; i < blackKeysOffsets.length; i++){
        var offset = blackKeysOffsets[i];
        $('#piano').append( blackKey(octaveOffset + offset, octaveNumber.toString() + blackKeysNames[i]) );
    }
}

//var ws = new WebSocket("ws://127.0.0.1:6789/")
var ws = new WebSocket("ws://192.168.1.64:6789/")
var wcReady
ws.onmessage = function(e){ console.log(e.data); $('body').append(e.data) };
//ws.onopen = () => ws.send('hello');

function myMidiCallback(midiMessage) {
    //Decode MIDI
    var type = midiMessage.data[0] == 144; //144 - on; 128 - off
    var note = midiMessage.data[1]; // [0-127] C1:37, C0:25 
    
    octaveNumber = Math.floor((note - 25) / 12)
    notePose = (note - 25)%12
    
    var notePose2Str = ['C', 'Cd', 'D', 'Dd', 'E', 'F', 'Fd', 'G', 'Gd', 'A', 'Ad', 'B'];
    
    var noteStr = '#' + octaveNumber.toString() + notePose2Str[notePose];
    
    //Draw note
    if(type)
        $(noteStr).addClass('pressed');
    else
        $(noteStr).removeClass('pressed');
        
    //Send note
    
}

$(document).ready(function(){
	$(document).keypress(function(e){ 
	    //$('#2G').addClass('pressed')
	
		if(ws.readyState == 1) {
			console.log(e.key); 
			$('body').append(e.key); 
			ws.send(e.key);
		}
	});
    
    for(var i = 0; i < 6; i++) 
	    drawOctave(i);
	$('#piano').append( $(SVG('text')).addClass('keySign').attr('y', 110).attr('x', 20*7*3 + 5).append('C1') );

	startMIDI(myMidiCallback)
});
