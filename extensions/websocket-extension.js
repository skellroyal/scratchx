new (function() {
    var ext_ = this;

    // Extension name
    var name = 'WebSocket extension';
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'connect to %s', 'connect'],
            ['w', 'disconnect %s', 'disconnect'],
        ]
    };

    var scriptpath = document.currentScript.src.match(/.*\//);
    $.getScript(scriptpath + 'ws-ext.js')
        .done( function(ws_ext, textStatus) {
            var eventTarget = document.createDocumentFragment();
            ws_ext_init(ext_, eventTarget);
            ScratchExtensions.register(name, descriptor, ext_);
        });

})({});
