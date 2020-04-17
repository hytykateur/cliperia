const fs = require('fs');
const ffmpeg = require('ffmpeg')
const clipboardListener = require('clipboard-event');
const clipboardy = require('clipboardy');
const child_process = require('child_process');
const config = {
    "app_name":"Cliperia b1.3",
    "window_size":[400,300],
    "isProcessAlready":false,
    "current_file":"",
    "howtouse_text":'Welcome! Copy an audio or video file to start!'
}

let valid_files = [];
const { 
  QMainWindow,
  QWidget,
  QLabel,
  QPushButton,
  QLineEdit

 } = require("@nodegui/nodegui");

 const root = new QWidget();
const mime = require('mime-types');
const path = require('path');
function stopApp() {
    clipboardListener.stopListening();
    ioHook.stop();
    process.kill(process.pid);
}
async function convertFile() {
    if (input_filename.text() != "") {
        var owo = 0
        for (owo = 0;owo < valid_files.length;owo++) {
        await new Promise( function (resolve, reject){
            let extension_requested = input_filename.text();
            let name_offile = path.parse(valid_files[owo]).name;
            let extension_offile = path.basename(valid_files[owo]).split('.')[path.basename(valid_files[owo]).split('.').length-1];
            button.hide();
            input_filename.hide();
            config.isProcessAlready = true;

            setStatus('Processing '+path.basename(valid_files[owo]).substring(0,30)+' ...'+(owo+1)+'/'+valid_files.length);
            try {
                if (process.platform == "linux") {

                    var command = "ffmpeg";
                    
                }
                if (process.platform == "win32") {
                    var command = "ffmpeg.exe";
                    if (!fs.existsSync(command)) {
                        setStatus('ffmpeg.exe was not found');
                        config.isProcessAlready = false;
                        throw "ffmpegNotFound"
                        resolve();
                    }
                }
                if (fs.existsSync(path.join(path.dirname(valid_files[owo]),name_offile+"."+extension_requested))) {
                    try {
                        fs.unlinkSync(path.join(path.dirname(valid_files[owo]),name_offile+"."+extension_requested));
                    } catch (e) {
                        console.log(e);
                    }
                }
                var args = [ '-i',valid_files[owo],path.join(path.dirname(valid_files[owo]),name_offile+"."+extension_requested)]
                    var exec = child_process.spawn(command,args);
                    exec.on('message',function (e) {
                    })
                    exec.on('exit',function (e) {
                        if (e == 0) {
                            console.log(owo+1);
                        } else {

                            setStatus("Hmm, there was errors ...");
                        }
                        resolve();
                    })
            } catch (e) {

                setStatus('Error, check the console !')
                console.log(e.code);
                console.log(e.msg);
                resolve();
            }

            });
        }

        setStatus(config.howtouse_text);
        config.isProcessAlready = false;

     }
}
function getCurrentFile() {
    return config.current_file;
}
function setStatus(text) {
    global.window_status.setText(text);
}
function drawGui() {
    const win = new QMainWindow();
    win.setInlineStyle('background: black;width:100%;')
    win.setFixedSize(config.window_size[0],config.window_size[1]);
    win.setWindowTitle(config.app_name);
    
    //Title window
    window_title = new QLabel(root);
    window_title.setText(config.app_name);
    window_title.setInlineStyle("text-align: center;font-size: 30px;color: white; background-color: transparent;flex: 1;qproperty-alignment: 'AlignCenter';");
    window_title.setFixedSize(config.window_size[0],100)

    //App status
    window_status = new QLabel(root);
    window_status.setText(config.howtouse_text); 
    window_status.setInlineStyle("text-align: center;font-size: 15px;color: white; background-color: transparent;flex: 1;qproperty-alignment: 'AlignCenter';");
    window_status.setFixedSize(config.window_size[0],200)
    //Convert button
    const convert_button = new QPushButton(root);
    convert_button.setText('Convert');
    convert_button.setGeometry(config.window_size[0]/2 - 50,config.window_size[1]/2 + 100,100,20)
    convert_button.setInlineStyle("color:black;background:white;")
    convert_button.addEventListener('clicked', () => {
        convertFile();
    });
    convert_button.hide();
    //File input
    const input_filename = new QLineEdit(root);
    input_filename.setGeometry(config.window_size[0]/2 - 150,config.window_size[1]/2 + 40,300,20)
input_filename.hide();

    win.setCentralWidget(root);
    win.show();
    global.input_filename = input_filename;
    global.button = convert_button;
    global.window_status = window_status;
    global.win = win;
}
    

function initWindow() {
    clipboardListener.startListening();
    clipboardListener.on('change', () => {
        let clipped_files = clipboardy.readSync().split('\n');
        valid_files = [];
        //Check files mime type
        for (var i = 0; i < clipped_files.length;i++) {
            
            if (fs.existsSync(clipped_files[i]) && mime.lookup(clipped_files[i]) != false) {

                let format_type = mime.lookup(clipped_files[i]).split('/')[0];
                if (format_type == "video" || format_type == "audio") {
                    valid_files.push(clipped_files[i])
                }
            }
        }
        if (valid_files.length != 0 && config.isProcessAlready == false) {

            setStatus('Set extension for '+valid_files.length+' valid media')

            button.show();
            input_filename.show();
            input_filename.setText("mp3");
            global.win.activateWindow()
        }
    });
    /*
    ioHook.on("keypress", event => {
      if (event.keychar == 27) {
        stopApp();
      }
    });
    ioHook.start();*/
    drawGui();
}
initWindow();