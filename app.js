var login = require("facebook-chat-api");

EMAIL = process.env.MESSENGER_EMAIL;
PASSWORD = process.env.MESSENGER_PASSWORD;

friends = []
fr_by_uid = {}

login({email: EMAIL, password: PASSWORD}, function(err, api) {
    if(err) return console.error(err);


    api.getFriendsList(function(err, fr) {
        friends = fr;
        friends.forEach(function(friend) {
            fr_by_uid[friend.userID] = friend;
        });

        console.log("Starting message listener");

        api.listen(function(err, message) {
            if(err) console.error(err);
            author = message.senderID;
            console.log("Message from " + fr_by_uid[author].fullName);
            console.log(message.body);
            // api.sendMessage(message.body, message.threadID);
        });
    });

});
