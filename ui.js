var blessed = require("blessed");

var label_styles = {
    fg: "white",
    bg: "darkgray"
}
var input_styles = {
    fg: "white",
    bg: "black"
}

var select_callback;
var thread_navigators = {}
var threads = [];
// The boxes on the left representing threads

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
            form.setContent('Logging in...');
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
    showMainUI: function(_threads, _select_callback) {
        threads = _threads;
        ui.clear();

        /*
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
        */
        ui.genThreadNav();
        select_callback = _select_callback;
        ui.displayThreadsPane();
        if(!threads.length) {
            console.error("No threads to display!");
        } else {
            thread_navigators[threads[0].threadID].focus();
        }
        ui.screen.render();
    },

    genThreadNav: function() {
        thread_navigators.parent = blessed.box({
            scrollable: true,
            width: "30%",
            height: "100%",
            parent: ui.screen,
            top: 0,
            left: 0,
            style: {
                bg: "blue"
            },
            vi: true,
            scrollbar: {
                style: {
                }
            },
        });
    },

    genContentString: function(thr, max_w) {
		if (!max_w) { max_w = thread_navigators.parent.width - 6; }
        var content_name = thr.customName.length > max_w ?
            thr.customName.substring(max_w - 3).trim() + "..." : thr.customName;
        var content_snip = thr.snippet.length > max_w ?
            thr.snippet.substring(max_w - 3).trim() + "..." : thr.snippet;
        return "\n   "  + content_name + "\n   " + content_snip;
    },

    displayThreadsPane: function() {
        if(thread_navigators.parent) {
            ui.screen.remove(thread_navigators.parent);
        }
        ui.genThreadNav();
        var list = thread_navigators.parent;
        var thr_cnt = 0;
        var height = 4;

        var prev = null;
        var prev_id = null;
        var max_w = list.width - 6;
        threads.forEach(function(thr) {
            // list.pushItem(thr.customName);
            thread_navigators[thr.threadID] = blessed.box({
                parent: thread_navigators.parent,
                width: "100%",
                height: height,
                left: 0,
                top: height * thr_cnt++,
                content: ui.genContentString(thr, max_w),
                style: {
                    bg: thr.unreadCount > 0 ? 'magenta' : 'blue',
                    focus: {
                        bg: '#ff8c00',
                    }
                }
            });
            thread_navigators[thr.threadID].thread = thr;
            var thr_nav = thread_navigators[thr.threadID];
            if(prev) {
                thr_nav.prev = prev;
                prev.key(['down', 'right'], function() {
                    thr_nav.focus();
                });
                thr_nav.key(['up', 'left'], function() {
                    thr_nav.prev.focus();
                });
            }
            thr_nav.key('enter', function() {
                select_callback(thr_nav.thread.threadID);
            });
            prev = thr_nav;
            prev_id = thr.threadID;
        });
        thread_navigators[threads[0].threadID]
            .key(['up', 'left'], function() {
                thread_navigators[prev_id].focus();
            })
        prev.key(['down', 'right'], function() {
            thread_navigators[threads[0].threadID].focus();
        });
    },

    threadLoading: function() {
        if(!ui.threadPanel) ui.initThreadPanel();
        var loadingBox = blessed.box({
            parent: ui.threadPanel,
            top: "center",
            left: "center",
            height: 7,
            width: 21,
            border: 'line',
            content: '\n\n    Loading...'
        });
        ui.screen.render();
    },

    initThreadPanel: function() {
        if(ui.threadPanel) return;
        ui.threadPanel = blessed.box({
            parent: ui.screen,
            left: "30%",
            top: 0,
            width: "70%",
            height: "100%",
            style: {
                bg: "darkblue",
                fg: "white"
            }
        });
    },

    clearThreadPanel: function() {
        if(!ui.threadPanel) return;
        ui.threadPanel.children.forEach(function(el) {
            ui.threadPanel.remove(el);
        });
        ui.screen.render();
    },

    bringToTop: function(thr) {
        console.log("BRING TO TOP");
        thread_navigators[thr.threadID].snippet = thr.snippet;
        for(var i=0;i<threads.length;i++) {
            if(threads[i].threadID == thr.threadID) break;
        }
        if(i < threads.length) {
            threads.splice(i, i+1);
        }
        console.log("thr found");
        threads.unshift(thr);
        ui.displayThreadsPane();
        console.log("render");
        ui.screen.render();
    },

    messages: null,
    message_height: null,
    message_margin: 1,
    populate: function(threadID, uid, messages) {
		if(!ui.messages) {
            /* ui.messages is assumed to not exist */
            ui.message_height = 0;
            ui.messages = blessed.box({
                parent: ui.threadPanel,
                left: 0,
                top: 0,
                height: "99%",
                tags: true,
                mouse: true,
                border: 'line',
				scrollable: true,
                scrollbar: {
                    ch: ' ',
                    track: {
                        bg: 'yellow'
                    },
                    style: {
                        inverse: true
                    }
                }
            });
            var inp = blessed.textbox({
                parent: ui.threadPanel,
                left: 0,
                width: "100%",
                height: "1%",
                top: "99%"
            });
            // inp.focus();
        }
        /* TODO: Add names
		 * especially for group chats */
        message_height = ui.message_margin;
        messages.forEach(function(msg) {
            var m = blessed.box({
                left: msg.userID == uid ? "50%" : 0,
                top: message_height,
                content: msg.body,
				parent: ui.messages,
				height: 2,
                // height: "fit",
                width: 30,
                style: {
                    bg: msg.userID == uid ? "blue" : "lightgray"
                }
            });
            // console.log(m.content);
            message_height += m.height + message_margin;
        });
        ui.screen.render();
    }
};

exports.ui = ui;
