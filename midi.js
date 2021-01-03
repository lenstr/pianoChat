
var outputs;


function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function startMIDI(registerDevicesCallBack) {
    navigator.permissions.query({name:'midi'}).then(function(permissionStatus) {
        navigator.requestMIDIAccess().then(registerDevicesCallBack, onMIDIFailure);
        permissionStatus.onchange = function() {
            console.log('midi permission state has changed to ', this.state);
        };
    });
}
