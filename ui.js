var blessed = require("blessed");

var ui = {
    screen: blessed.screen({
        smartCSR: true,
        dump: __dirname + '/ui.log',
        warnings: true
    }),
    initScreen: function() {
        ui.screen.title = "Messenger";
        ui.screen.key(['escape','C-c'], function(ch, key) {
            ui.screen.destroy();
            return process.exit(0);
        });
        ui.screen.render();
    },
    showLoginPrompt: function() {
        var box = blessed.box({
            top: 'center',
            left: 'center',
            width: '20%',
            height: '20%',
            content: 'Logging in',
            tags: true,
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: "#f0f0f0"
                },
                hover: {
                    bg: 'green'
                }
            }
        });
        box.focus();
        ui.screen.append(box);
        ui.screen.render();
    }
};

exports.ui = ui;
