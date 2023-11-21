const Net = require('net');
//const dgram = require('dgram');

const status = [0xAA, 0x0D, 0x01, 0x00, 0x0E]
var statushex = new Uint8Array(status);
const panelonToSend = [0xAA, 0xF9, 0x01, 0x01, 0x01, 0xFC]
var panelonhex = new Uint8Array(panelonToSend);
const paneloffToSend = [0xAA, 0xF9, 0x01, 0x01, 0x00, 0xFB]
var paneloffhex = new Uint8Array(paneloffToSend);
const ecoSensor = [0xAA, 0x50, 0x01, 0x01, 0x00, 0x52]
var ecoSensorhex = new Uint8Array(ecoSensor);
const host1 = '192.168.10.115'
let onOrOff = 0;

setInterval(()=> sendRj(host1, 1515, ecoSensorhex), 2000 )

function controlScreen(host, port, hex) {
    let nobj = new Net.Socket();
    console.log('controlling panel status...')

    nobj.on('error', (err) => {
        console.error('Error:', err);
        obj.destroy();
    });

    nobj.on('close', () => {
        console.log('Connection closed');
    });

    nobj.connect({ port: port, host: host }, () => {
        console.log(`TCP connection established with the screen ${host}`);
        setTimeout(()=> {
            console.log('closing controlling due to inactivity...')
            nobj.destroy()
        }, 1000)
        setTimeout(() => {
            nobj.write(hex, (err) => {
                if (err) {
                    console.error('Write error:', err);
                    return;
                }
                console.log('Data written to server');
            });
        }, 100);
    });

}

function sendRj(host, port, hex) {
    setTimeout(()=> {
        console.log('closing due to inactivity...')
        obj.destroy()
    }, 1000)

    console.log('Starting', host, port, hex);

    let obj = new Net.Socket();

    // Listen for data from the server
    obj.on('data', (data) => {
        console.log('Received:', data);
        const buffer = Buffer.from(data)
        const thirdLastByte = buffer[buffer.length - 3];
        const secondLastByte = buffer[buffer.length - 2];
        const toBeDecoded = `${thirdLastByte.toString(16)}${secondLastByte.toString(16)}`
        const dec = parseInt(toBeDecoded,16)
        console.log('Measured LUX at the screen : ',dec)

        if (onOrOff === 0) if (dec > 40) {
            console.log('Turning on the screen')
            controlScreen(host1, 1515, paneloffhex)
            onOrOff = 1;
        }
        if (onOrOff === 1) if (dec < 40) {
            console.log('Turning off the screen')
            controlScreen(host1, 1515, panelonhex)
            onOrOff = 0;
        }

        // if (dec < 400) controlScreen(host1, 1515, paneloffhex)
        // if (dec > 400) controlScreen(host1, 1515, panelonhex)

        obj.destroy(); // Close the connection after receiving the data
    });

    // Listen for any errors
    obj.on('error', (err) => {
        console.error('Error:', err);
        obj.destroy();
    });

    obj.on('close', () => {
        console.log('Connection closed');
    });

    obj.connect({ port: port, host: host }, () => {
        console.log(`TCP connection established with the screen ${host}`);

        setTimeout(() => {
            obj.write(hex, (err) => {
                if (err) {
                    console.error('Write error:', err);
                    return;
                }
                console.log('Data written to server');
            });
        }, 100);
    });
}

function sendUDP(host, port, command) {
    const message = Buffer.from(command);
    const socket = dgram.createSocket('udp4');
    socket.send(message, 0, message.length, port, host, (err) => {
        console.log(`Sent ${message} to ${host} - if Error then :`, err)
        socket.close();
    });
}


exports.sendRj = sendRj
exports.sendUDP = sendUDP

