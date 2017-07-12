const electron = require('electron');

const ipcMain = electron.ipcMain;

ipcMain.on("initSerialPort", function(event, path, opt){
    // //此处初始化serialport，并保存serialport对象
    let serialport = initSerialPort(path, opt, function(err){
        console.log("===============receive render initSerialPort", path, opt, err);
        if(err){
            event.sender.send("serialPortInited", err, null);
            return;
        }
        //保存serialport
        serialportList.push(serialport);
        //返回消息给ui的render端， ui拿到serialport对象去执行open，close，write等操作
        event.sender.send("serialPortInited", null, serialport);
    });
})

ipcMain.on("destorySerialPort", function(event, serialport){
    //此处close serialport对象
    destorySerialPort(serialport, function(err){
        console.log("===============receive render serialportDestoryed", err);
        event.sender.send("serialportDestoryed", "---------------serialportDestoryed msg cb")
    })
    
});

ipcMain.on("destoryAllSerialPort", function(event){
    //此方法可以在main close时调用，防止有些打开的serialport没有关闭
    destoryAllSerialPort(function(err){
        console.log("===============receive render destoryAllSerialPort", err);
        event.sender.send("allSerialPortDestoryed", "---------------allSerialPortDestoryed msg cb")
    })
})


var SerialPort = require("serialport").SerialPort;
var serialportList = [];

function initSerialPort(path, opt, cb){
    var item = new SerialPort(path, opt, cb);
    serialportList.push(item);
    return item;
}

function destorySerialPort(serialport, cb){
    for(let index in serialportList){
        if(serialportList[index] === serialport){
            serialport.close(function(err){
                console.log(err);
                cb(err);
                serialportList.splice(item, 1);    
            });

        }
    }
}

export function destoryAllSerialPort(cb){
    var me = this;
    if(serialportList.length >= 0){
        var item = serialportList[0];
        item.close(function(err){
            if(err){
                console.error(err);
            }
            serialportList.splice(item, 1);
            if(serialportList.length >= 0){
                me.destorySerialPort();
            }else{
                cb();
            }
        });
    }else{
        cb();
    }
    
}