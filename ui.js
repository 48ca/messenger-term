var blessed = require("blessed");

var common_styles = {
    fg: 'white',
    bg: 'black',
    focus: {
        bg: 'black'
    },
    hover: {
        bg: 'red'
    }
}

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

    showLoginPrompt: function(username, password, callback) {
        var _username = username;
        var _password = password;
        var form = blessed.form({
            parent: ui.screen,
            keys: true,
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            bg: 'gray'
        });

        var inbox = blessed.box({
            parent: form,
            height: 15,
            width: 60,
            style: {
                bg: 'black',
                fg: 'white',
                border: 'line'
            },
            top: 'center',
            left: 'center'
        });

        var label = blessed.text({
            parent: inbox,
            top: 2,
            left: "center",
            width: 9,
            content: "Messenger",
            height: 1,
            style: {
                fg: "white"
            }
        });

        var username_label = blessed.text({
            parent: inbox,
            top: 3,
            left: 5,
            width: 50,
            content: "Username",
            height: 1,
            style: {
                fg: "white"
            }
        });

        var password_label = blessed.text({
            parent: inbox,
            top: 6,
            left: 5,
            width: 50,
            content: "Password:",
            height: 1,
            style: {
                fg: "white"
            }
        });

        var username_field = blessed.textbox({
            parent: inbox,
            content: _username,
            top: 4,
            left: 5,
            width: 50,
            height: 1,
            inputOnFocus: true,
            style: common_styles
        });

        var password_field = blessed.textbox({
            parent: inbox,
            content: _password,
            censor: true,
            top: 7,
            left: 5,
            width: 50,
            height: 1,
            inputOnFocus: true,
            style: common_styles
        });

        var submit = blessed.button({
            parent: inbox,
            mouse: true,
            keys: true,
            shrink: true,
            padding: {
                left: 1,
                right: 1
            },
            left: 15,
            top: 10,
            width: 10,
            shrink: true,
            name: 'login',
            content: 'login',
            style: {
                focus: {
                    bg: 'red'
                },
                hover: {
                    bg: 'red'
                }
            }
        });

        var cancel = blessed.button({
            parent: inbox,
            mouse: true,
            keys: true,
            shrink: true,
            padding: {
                left: 1,
                right: 1
            },
            left: 35,
            top: 10,
            width: 10,
            shrink: true,
            name: 'cancel',
            content: 'cancel',
            style: {
                focus: {
                    bg: 'red'
                },
                hover: {
                    bg: 'red'
                }
            }
        });

        submit.on('press', function() {
            form.submit();
        });

        cancel.on('press', function() {
            form.reset();
        });

        form.on('submit', function(data) {
            _username = username_field.value;
            _password = password_field.value;
            callback(_username, _password, function() {
                form.setContent('Login failed');
                ui.screen.render();
            });
            ui.screen.render();
        });

        form.on('reset', function(data) {
            process.exit(0);
        });

        username_field.setValue(username);
        password_field.setValue(password);
        if(!username) username_field.focus();
        else if(!password) password_field.focus();
        else submit.focus();

        ui.screen.render();
    },

    showMainUI: function() {
       ui.screen.realloc();
    }

};

exports.ui = ui;
