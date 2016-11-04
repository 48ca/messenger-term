var login = require("facebook-chat-api");
var ui = require("./ui.js").ui;

EMAIL = process.env.MESSENGER_EMAIL;
PASSWORD = process.env.MESSENGER_PASSWORD;

ui.initScreen();

friends = []
fr_by_uid = {}
ui.showLoginPrompt(EMAIL, PASSWORD, function(email, password, callback) {
    EMAIL = email
    PASSWORD = password
    login({email: email, password: password}, function(err, api) {
        if(err) {
            return callback(err);
        }
        api.getFriendsList(function(err, fr) {
            friends = fr;
            friends.forEach(function(friend) {
                fr_by_uid[friend.userID] = friend;
            });

            console.log("Starting message listener");
            ui.showMainUI();

            api.listen(function(err, message) {
                if(err) console.error(err);
                author = message.senderID;
                console.log("Message from " + fr_by_uid[author].fullName);
                console.log(message.body);
                // api.sendMessage(message.body, message.threadID);
            });
        });

    });
});
