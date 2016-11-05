var blessed = require("blessed");

var label_styles = {
    fg: "white",
    bg: "darkgray"
}
var input_styles = {
    fg: "white",
    bg: "black"
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
            bg: 'black'
        });

        var inbox = blessed.box({
            parent: form,
            height: 15,
            width: 60,
            style: label_styles,
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
            style: label_styles
        });

        var username_label = blessed.text({
            parent: inbox,
            top: 4,
            left: 5,
            width: 50,
            content: "Email",
            height: 1,
            style: label_styles
        });

        var password_label = blessed.text({
            parent: inbox,
            top: 7,
            left: 5,
            width: 50,
            content: "Password",
            height: 1,
            style: label_styles
        });

        var username_field = blessed.textbox({
            parent: inbox,
            content: _username,
            top: 5,
            left: 5,
            width: 50,
            height: 1,
            inputOnFocus: true,
            style: input_styles
        });

        var password_field = blessed.textbox({
            parent: inbox,
            content: _password,
            censor: true,
            top: 8,
            left: 5,
            width: 50,
            height: 1,
            inputOnFocus: true,
            style: input_styles
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
                bg: "darkgray",
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
                bg: "darkgray",
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

    clear: function() {
        ui.screen.children.forEach(function(ch) {
            ui.screen.remove(ch);
        });
    },

    threadPanel: null,
    sendPanel: null,
    showMainUI: function(threads, select_callback) {
        ui.clear();

        var list = blessed.list({
            width: "30%",
            height: "100%",
            parent: ui.screen,
            top: 0,
            left: 0,
            keys: true,
            scrollable: true,
            style: {
                selected: {
                    bg: "red",
                },
                item: {
                    bg: "blue",
                },
                search: true,
                bg: "green",
                scrollbar: {
                    bg: 'blue'
                },
                vi: true
            }
        });
        threads.forEach(function(thr) {
            list.pushItem(thr.customName);
        });

        list.focus();

        list.on('select', function(item) {
            select_callback(item.content);
        });

        ui.screen.render();
    },

    clearThread: function() {
        if(!ui.threadPanel) return;
        ui.screen.remove(ui.threadPanel);
        ui.screen.remove(ui.sendPanel);
        ui.screen.render();
    },

    populate: function(threadID, history) {
        if(!ui.threadPanel) {
            var messages = blessed.list({
                parent: ui.screen,
                left: "30%",
                top: 0,
                width: "70%",
                height: "98%",
                style: {
                    bg: "red"
                }
            });
            history.forEach(function(msg) {
                messages.pushItem(msg.body);
            });
            ui.threadPanel = messages;
        }
        if(!ui.sendPanel) {
            var panel = blessed.textbox({
                parent: ui.screen,
                left: "30%",
                width: "70%",
                height: "2%",
                top: "98%"
            });
        }
        ui.screen.render();
    }
};

exports.ui = ui;
