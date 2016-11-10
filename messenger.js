#!/usr/bin/env node

DEBUG = process.env["DEBUG"].toLowerCase() == "true";

var login;

if(DEBUG) {
	login = require("facebook-chat-api");
} else {
	login = require("facebook-chat-api-nolog");
}

var ui = require("./ui.js").ui;

var EMAIL = process.env.MESSENGER_EMAIL;
var PASSWORD = process.env.MESSENGER_PASSWORD;

var NUM_THREADS = 100;

ui.initScreen();

var friends = []
var fr_by_uid = {}
var fr_by_name = {}
var people = []
var ppl_by_uid = {}
var ppl_by_name = {}

var threads = []
var threads_by_name = {}
var threads_by_id = {}

var fb;

var uid;

var loaded_thread;

function selectCallback(threadID) {
    var thread = threads_by_id[threadID];
    loaded_thread = thread;
    ui.clearThreadPanel();
    ui.threadLoading();
    fb.getThreadInfo(thread.threadID, function(err, info) {
        var lastMess = info.messageCount - 1;
        var firstMess = lastMess - 100 < 0 ? 0 : lastMess - 100
        fb.getThreadHistory(thread.threadID, firstMess, lastMess, undefined, function(err, history) {
            ui.populate(thread.threadID, uid, history);
        });
    });
};

function addMessage(message) {
    /* TODO: Make this more efficient without requiring two queries */
    console.log("step 1");
    fb.getThreadList(0, 10, function(err, arr) {
        console.log("step 2");
        var thr;
        arr.forEach(function(el) {
            if(el.threadID == message.threadID) {
                thr = el;
                return;
            }
        });
        if(!thr) return console.error("!!! We have received a message from a non-existant thread");
        console.log("step 3");
        var name = genCustomName(thr);
        thr.customName = name;
        threads_by_name[name] = thr;
        threads_by_id[message.threadID] = thr;

        if(loaded_thread && loaded_thread.threadID == thr.threadID) {
            ui.populate(thr.threadID, uid, [message]);
        }
        console.log("step 4");
        ui.bringToTop(thr);
    });
};

function genCustomName(thr) {
    var name = thr.name;
    if(!name) {
        var part = thr.participants;
        var ind = part.indexOf(uid);
        if(ind > 0) {
            part.splice(ind, 1);
        }
        if(part.length == 1) {
            var fr = part[0];
            if(fr_by_uid[fr]) {
                name = fr_by_uid[fr].fullName;
            }
            /* TODO: make this work for non-friends */
        }
    }
    if(!name) name = "UNDEFINED";
    return name;
}

ui.showLoginPrompt(EMAIL, PASSWORD, function(email, password, callback) {
    EMAIL = email
    PASSWORD = password
    login({email: email, password: password}, function(err, api) {
        if(err) {
            return callback(err);
        }
        fb = api;
        uid = fb.getCurrentUserID();
        fb.getThreadList(0, NUM_THREADS, function(err, arr) {
            threads = arr;
            arr.forEach(function(thr) {
                var name = genCustomName(thr);
                thr.customName = name;
                threads_by_name[name] = thr;
                threads_by_id[thr.threadID] = thr;
            });
            ui.showMainUI(threads, selectCallback);
        });
        fb.getFriendsList(function(err, fr) {
            friends = fr;
            friends.forEach(function(friend) {
                fr_by_uid[friend.userID] = friend;
                fr_by_name[friend.fullName] = friend;
            });

            fb.listen(function(err, message) {
                if(err) console.error(err);
                addMessage(message);
            });
        });
    });
});
