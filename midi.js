
function getMIDIMessage(midiMessage) {
    //console.log(midiMessage);
    var type = midiMessage.data[0]; //144 - on; 128 - off
    var note = midiMessage.data[1]; // [0-127]
    if(type == 144)
        console.log(note);
}

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);

    var inputs = midiAccess.inputs;
    var outputs = midiAccess.outputs;
    
    for (var input of midiAccess.inputs.values()) {
        console.log('access device')
        input.onmidimessage = _midiCallBack; //getMIDIMessage;
    }
    
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function startMIDI(midiCallBack) {
    _midiCallBack = midiCallBack;
    navigator.permissions.query({name:'midi'}).then(function(permissionStatus) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        permissionStatus.onchange = function() {
            console.log('midi permission state has changed to ', this.state);
        };
    });
}

var _midiCallBack;// = getMIDIMessage
