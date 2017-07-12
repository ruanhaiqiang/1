

## node-serialport-electron
串口工具node-serialport添加electron编译方式
1. electron版本：v1.6.10（和electronshell中electron版本保持一致，可在./node-serialport-electron/package.json文件中修改）
2. 调试：在electronshell打开的electron控制台中引用并调试，直接在node
环境中是无法调试的
3. 打包方法：
    ia32版本：在./node-serialport-electron执行grunt buildia32
    x64版本：在./node-serialport-electron执行grunt buildx64

## electronshell

### 1. electronshell main与render 初始化或者注销独占资源问题

背景：
    当打开electron并，通过addon加载某资源，但是该资源必须需要手动释放。
    条件1. 当在web前端使用了该资源，但是并没有释放资源，可能会导致下一次加载失败，这个可以通过控制web加载释放解决。
    条件2. 对于一些全局性的资源，当electron初始化时候加载，当electron关闭时释放，但是如果资源另外起了进程，如果用户直接按了electron的关闭按钮，该资源的进程是不能被释放，可能会导致下一次使用出现问题。
原因：
    electron web ui无法捕捉electron close事件，导致资源不能被释放

解决方案：
    通过electron ipc机制，在electron关闭时，主动释放资源


实例：
    该例子，在ui上添加了几个button，通过button点击事件，发送消息给ipcMain
    
    1.1 main进程初始化
    可以在app ready的回调函数里面，添加对资源的初始化，参考./electronshell/app/main.dev.js——92行
    1.2 main进程destory
    可以在app exit时，添加对资源的释放，参考./electronshell/app/main.dev.js——52行
    1.3 main与render通讯方法
        A.在main里面添加引用一个serialport.js文件， 参考./electronshell/app/main.dev.js——15行
        B.在serialport.js中通过ipcMain监听render端的消息，并且可以发送event事件到render端， 参考./electronshell/app/serialport.js
        C.在render UI上可以通过ipcRenderer监听消息并发送给main，参考：./electronshell/app/app.html ---47行

小结：
    通过说明这个问题，只是需要说明对于addon中资源的释放存在的问题，并不是说所有的addon都需要通过这种方式进行释放资源。正常情况下，一般addon，在调用执行完成以后，即可执行释放。只有那种全局性声明周期和electron类型，并且另外起了新的进程或者现成，并且electron强制关闭都不能使其资源释放的addon才需要。