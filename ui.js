var blessed = require("blessed");

var ui = {
    screen: blessed.screen({
        smartCSR: true
    }),
    initScreen: function() {
        ui.screen.title = "Messenger";
        ui.screen.key(['escape','C-c'], function(ch, key) {
            return process.exit(0);
        });
        ui.screen.render();
    },
    showLoginPrompt: function() {
        var box = blessed.box({
            top: 'center',
            left: 'center',
            width: '40px',
            height: '40px',
            content: 'Logging in',
            style: {
                fg: 'white'
            }
        });
        box.focus();
        ui.screen.append(box);
        ui.screen.render();
    }
};

exports.ui = ui;
