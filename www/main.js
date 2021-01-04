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

var notePose2Str = ['C', 'Cd', 'D', 'Dd', 'E', 'F', 'Fd', 'G', 'Gd', 'A', 'Ad', 'B'];
var ws = false;

var inputDevices = [];
var outputDevices = [];
var currectOutputDevice = 0;

function updateDevices(midiAccess) {
    console.log(midiAccess);

    var inputs = midiAccess.inputs;
    var outputs = midiAccess.outputs;
    
    for(let input of inputs.values()) {
        inputDevices.push(input)
    }
    
    outputDevices.push({name: "None"})
    for(let output of outputs.values()) {
        outputDevices.push(output)
    }
    
    //draw
    for(let [i, input] of inputDevices.entries()) {
        $('#inputMIDIDevices').append('<option value="' + i + '">' + input.name + '</option>')
    }
    
    for(let [i, output] of outputDevices.entries()) {
        $('#outputMIDIDevices').append('<option value="' + i + '">' + output.name + '</option>')
    }
    
    registerInputCallback(0)
}

function registerInputCallback(index) {
    for(let [i, input] of inputDevices.entries()) {
        if(i == index)
            input.onmidimessage = myMidiCallback
        else
            input.onmidimessage = dummyCallback
    }
}

function myMidiCallback(midiMessage) {

    if( midiMessage.data[0] != 144 && midiMessage.data[0] != 128 )
        return;

    console.log(midiMessage)

    //Decode MIDI
    var pressedSig = midiMessage.data[0] == 144; //144 - on; 128 - off
    var note = midiMessage.data[1]; // [0-127] C1:37, C0:25 
    var velocity = midiMessage.data[2];
    
    octaveNumber = Math.floor((note - 24) / 12)
    notePose = (note - 24)%12
    
    var noteStr = '#' + octaveNumber.toString() + notePose2Str[notePose];
    //console.log('local note ID: ' + noteStr + '; mess: ' + midiMessage.data)
    //Draw note
    if(pressedSig && velocity > 0)
        $(noteStr).addClass('pressed');
    else if(!pressedSig || (pressedSig && velocity == 0))
        $(noteStr).removeClass('pressed');
        
    //Send note
    if(ws && ws.readyState == 1) {
        var message = {};
        message.type = 'midi';
        message.data = midiMessage.data;
        ws.send( JSON.stringify(message) );
	}
}

function dummyCallback(midiMessage) {}

$(document).ready(function(){
    var isWebSocketsSupported = (("WebSocket" in window && window.WebSocket != undefined) || ("MozWebSocket" in window));
    if(isWebSocketsSupported)
        $('#webSocketsSupport').text('да')
    else
        $('#webSocketsSupport').text('НЕТ!')
    
    const baseHref = document.getElementById('base-href')
    const baseWSUrl = baseHref.href.replace('http', 'ws')
    ws = new WebSocket(`${baseWSUrl}ws`)
    
    ws.onmessage = function(e){ 
        message = JSON.parse(e.data); 
        if(message.type == 'midi') {
            var midiMessage = message.data;
            
            var pressedSig = midiMessage[0] == 144; //144 - on; 128 - off
            var note = midiMessage[1]; // [0-127] C1:37, C0:25     
            var velocity = midiMessage[2];
            
            octaveNumber = Math.floor((note - 24) / 12)
            notePose = (note - 24)%12
            
            var noteStr = '#' + octaveNumber.toString() + notePose2Str[notePose];
            console.log('remote note ID: ' + noteStr)
            if(pressedSig && velocity > 0)
                $(noteStr).addClass('pressedRemote');
            else if(!pressedSig || (pressedSig && velocity == 0))
                $(noteStr).removeClass('pressedRemote');
                
            //Propagate to local piano
            if(currectOutputDevice > 0) {
                var outMessage = [midiMessage[0], midiMessage[1], midiMessage[2]]
                outputDevices[currectOutputDevice].send(outMessage)
            }
        } else if(message.type == 'users') {
            $('#userCount').text(message.count)
        } else {
            console.log('Error: unsupported input message');
        }
    };
    
	$(document).keypress(function(e){});
	
    
    for(var i = 0; i < 6; i++) 
	    drawOctave(i);
	$('#piano').append( $(SVG('text')).addClass('keySign').attr('y', 110).attr('x', 20*7*3 + 5).append('C1') );

	startMIDI(updateDevices)
	
	$('#inputMIDIDevices').change(function() {
        index = $(this).find(":selected").attr('value')
        console.log('Change input to index: ' + index)
        registerInputCallback(index)
    });
    
    $('#outputMIDIDevices').change(function() {
        index = $(this).find(":selected").attr('value')
        currectOutputDevice = index
    });
});
