const electron = require('electron');

const ipcMain = electron.ipcMain;
ipcMain.on("initSerialPort", function(event, path, opt){
    // //此处初始化serialport，并保存serialport对象
    initSerialPort(path, opt, function(err, serialport){
        console.log("===============receive render initSerialPort", path, opt, err.toString());
        if(err){
            event.sender.send("serialPortInited", err.toString(), null);
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
        console.log("===============receive render serialportDestoryed", err.toString());
        event.sender.send("serialportDestoryed", "---------------serialportDestoryed msg cb")
    })
    
});

ipcMain.on("destoryAllSerialPort", function(event){
    //此方法可以在main close时调用，防止有些打开的serialport没有关闭
    destoryAllSerialPort(function(err){
        console.log("===============receive render destoryAllSerialPort", err.toString());
        event.sender.send("allSerialPortDestoryed", "---------------allSerialPortDestoryed msg cb")
    })
})


var serialport = require("serialport");
var serialportList = [];

function initSerialPort(path, opt, cb){
    var item = new serialport.SerialPort(path, opt, function(err){
        if(err == null){
            serialportList.push(item);
            cb(null, item);
        }else{
            cb(err, null);
        }

    });
}

function destorySerialPort(serialport, cb){
    let flag = false;
    for(let index in serialportList){
        if(serialportList[index] === serialport){
            flag = true;
            serialport.close(function(err){
                console.log(err);
                cb(err);
                serialportList.splice(item, 1);    
            });
        }
    }
    if(!flag){
        cb("serilport is null")
    }
}

export function destoryAllSerialPort(cb){
    var me = this;
    if(serialportList.length >= 0){
        var item = serialportList[0];
        if(item != null){
            item.close(function(err){
                if(err){
                    console.error(err);
                    cb(err);
                }
                serialportList.splice(item, 1);
                if(serialportList.length >= 0){
                    me.destorySerialPort();
                }else{
                    cb();
                }
            });
        }else{
            cb("serialport is null")
        }
        
    }else{
        cb();
    }
    
}