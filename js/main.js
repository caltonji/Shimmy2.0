MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  
var loadShimmy = function() {
    setupPanels();
    addClickEvents();
    setupReminders();

    switchToInfo();
    //handle recent friends
    addRecentFriendsToDom();
    checkForNewFriends();
}




/*
    GENERAL DOM INTERACTION
*/

var recent_friends_container = `
<div id="recent_friends_container" class="shimmyhidden shimmy_panel"></div>
`;
var reminders_container = `
<div id="reminders_container" class="shimmyhidden shimmy_panel"></div>
`;

var noRemindersMessage = `
<div class="card no_notifications_message">You have no reminders at this time, looks like you can relax <span style="color:rgba(0,0,0,1);;">&#x1F61C;</span></div>
`;

var noRecentFriendsMessage = `
<div class="card no_notifications_message">You have no recent friends at this time, it doesn't mean you're not cool!</div>
`;

var clearRecentFriendsContainer = function() {
    $(scrollable).find("#recent_friends_container").empty();
    $(scrollable).find('#recent_friends_container').append(noRecentFriendsMessage);
}

var clearRemindersContainer = function() {
    $(scrollable).find("#reminders_container").empty();
    $(scrollable).find('#reminders_container').append(noRemindersMessage);
}

var scrollable;
var recentFriendsNotification;
var remindersNotification;
var infoPanel;
var remindersPanel;

var options = `
    <div id ="shimmy_logo">Shimmy</div>
    <div id="options_holder">
        <div class="option" id= "info_buttton"><span>Info</span></div>
        <div class="option" id= "reminders_button" title="Check your reminders">
            <span>Reminders</span>
            <div class="noti_bubble" id="reminders_noti">4</div>
        </div>
        <div class="option" id= "recent_friends_button" title="Check your recent friends">
            <span>Recent Friends</span>
            <div class="noti_bubble" id="recent_friends_noti">4</div>
        </div>
    </div>  
`;

var setupPanels = function() {
    var container = $('div[role="main"]').children().eq(2).children().first();
    scrollable = $(container).children().first();
    infoPanel = $(scrollable).children().first();
    $(scrollable).children().addClass('shimmy_panel');
    $(scrollable).prepend(reminders_container);
    remindersPanel = $(scrollable).children().first();
    $(scrollable).prepend(recent_friends_container);
    $(scrollable).prepend(options);  

    recentFriendsNotification = 0;
    remindersNotification = 0;
    // $("#ShimmyContainer").prepend(options);
    // $("body").children(":first").css("padding-right", "250px");
}





var addClickEvents = function() {
    $('body').on('click', '#info_buttton', function () {
        switchToInfo();
    });
    $('body').on('click', '#recent_friends_button', function () {
        switchToRecentFriends();
    });
    $('body').on('click', '#reminders_button', function () {
        switchToReminders();
    });
    $('body').on('click', '.friend_remove_icon', function () {
        removeFriend(this);
    });
    $('body').on('click', '.add_reminder_button', function() {
        clickAddReminder();
    });
    $('body').on('click', '.reminder_remove_icon', function () {
        removeReminder(this);
    });
}


var switchToInfo = function() {
    $(scrollable).children().removeClass('shimmyhidden');
    $(scrollable).find('#recent_friends_container').addClass('shimmyhidden');
    $(scrollable).find('#reminders_container').addClass('shimmyhidden');
    //add underline
    $(scrollable).find('#options_holder').children().removeClass('underline');
    $(scrollable).find('#info_buttton').addClass('underline');
}

var switchToRecentFriends = function() {
    $(scrollable).children().addClass('shimmyhidden');
    $(scrollable).find('#recent_friends_container').removeClass('shimmyhidden');
    $(scrollable).find('#options_holder').removeClass('shimmyhidden');
    $(scrollable).find('#shimmy_logo').removeClass('shimmyhidden');
    //add underline
    $(scrollable).find('#options_holder').children().removeClass('underline');
    $(scrollable).find('#recent_friends_button').addClass('underline');
}

var switchToReminders = function() {
    $(scrollable).children().addClass('shimmyhidden');
    $(scrollable).find('#reminders_container').removeClass('shimmyhidden');
    $(scrollable).find('#options_holder').removeClass('shimmyhidden');
    $(scrollable).find('#shimmy_logo').removeClass('shimmyhidden');
    //add underline
    $(scrollable).find('#options_holder').children().removeClass('underline');
    $(scrollable).find('#reminders_button').addClass('underline');
}

/*
    RECENT FRIENDS BUSINESS LOGIC
*/

var checkForNewFriends = function() {
    getRecentFriends(function(friends) {
        if (!friends) {
            return false;
        }
        saveNewFriendsToStorage(friends, function(numberNewFriends) {
            if (numberNewFriends) {
                
                addRecentFriendsToDom(numberNewFriends);
                switchToRecentFriends();   
            }
        });
    });
}

var incrementRecentFriendsNotification = function(num) {
    //declare default value
    num = num || 1;
    recentFriendsNotification += num;
    updateRecentFriendsNotification(recentFriendsNotification);
}

var decrementRecentFriendsNotification = function(num) {
    //declare default val
    num = num || 1;
    recentFriendsNotification -= num;
    updateRecentFriendsNotification(recentFriendsNotification);
}

var clearRecentFriendsNotification = function() {
    recentFriendsNotification = 0;
    updateRecentFriendsNotification(recentFriendsNotification);
}


/*
 RECENT FRIENDS DOM INTERACTION
*/
var buildCard = function(data, callback) {
    var card = '<div class="card">\n';
    card = card + '<img class="profileImg" src="' + data.imgUrl + '">\n';
    card = card + '<div class="friend_remove_icon" title="Remove this notification"" name="' + data.name + '">X</div>\n';
    card = card + '<div class="nameholder">';
    card = card + '<a class="directMessage" target="_blank" title="Send a FB message to ' + data.name + '" href="https://www.facebook.com/messages/' + data.urlAppend + '" urlAppend="' + data.urlAppend + '">' + data.name + '</a>\n';
    card = card + '</div>\n';
    card = card + '</div>';
    callback(card);
}

var buildNewRecentFriendsMessage = function(num) {
    var message = '<div class="new_recent_friends_message">You have ' + num + ' new recent friends</div>';
    return message;
}


var addRecentFriendsToDom = function(numRecentFriends) {
    clearRecentFriendsContainer();
    clearRecentFriendsNotification();
    chrome.storage.sync.get('shimmy_friends_data', function(result) {
        var friends_data = result.shimmy_friends_data;
        // console.log(friends_data);
        for (var id in friends_data) {
            if (friends_data[id]) {
                buildCard(friends_data[id], function(card) {
                    // console.log(card)
                    addToStartOfRecentFriends(card)
                    incrementRecentFriendsNotification();
                });
            }
        }
        if (numRecentFriends) {
            var message = buildNewRecentFriendsMessage(numRecentFriends);
            $("#recent_friends_container").prepend(message);
        }
    });
}

var addToStartOfRecentFriends = function(card) {
    $("#recent_friends_container").children().first().after(card);
}

var removeFriend = function(element) {
    console.log("removing " + $(element).attr('name'));
    removeFriendFromStorage($(element).attr('name'), function() {
        clearRecentFriendsNotification();
        addRecentFriendsToDom();
    });   
}

var updateRecentFriendsNotification = function(num) {
    $('#recent_friends_noti').text(String(num));
}

/*
    RECENT FRIENDS AJAX
*/

var getRecentFriends = function(callback) {
    $.ajax({
            url : "https://www.facebook.com/me/friends_recent",
            success : function(result){
                // setup();
                // console.log("success");
                // console.log(result);
                var re = /<ul class="uiList _262m _4kg" data-pnref="friends">.*<\/ul>/g;
                var friends = result.match(re)[0];

                var friendList = $(friends).find("li");
                var friendDataList = [];
                var i = 0;
                // var totalFriends = friendList.length;
                $.each(friendList, function(i, friend) {
                    // console.log(friend);
                    var data_pnref = $(friend).children().first().attr('data-pnref');
                    if (data_pnref != 'all') {
                        var name = $(friend).find(".uiProfileBlockContent").find('a').text();
                        var url = $(friend).find("a").eq(1).attr('href');
                        var imgUrl = $(friend).find("img").attr('src');
                        var urlAppend = url.replace('https:\/\/www\.facebook\.com\/', '');
                        var data = {name : name, urlAppend : urlAppend, imgUrl : imgUrl};
                        friendDataList.push(data);
                    }
                    i += 1;
                    if (i == friendList.length) {
                        callback(friendDataList)
                    }
                    console.log(data);

                    // $("#ShimmyContainer").append(card);
                });

                // console.log(c.find("#pagelet_timeline_main_column").children().eq(1));
                // console.log(c.find("#pagelet_main_column_personal"));
                
            },
            error : function(result) {
                console.log("error");
                callback(false);
            }

    });
}

/*
    RECENT FRIEND STORAGE INTERACTIONS
*/

var removeFriendFromStorage = function(name, callback) {
    chrome.storage.sync.get(['shimmy_friends_data', 'shimmy_friends'], function(result) {
        var friends_data = result.shimmy_friends_data;
        var friends = result.shimmy_friends;

        var id = String(friends.indexOf(name));
        friends_data[id] = false;
        chrome.storage.sync.set({shimmy_friends_data : friends_data}, function() {
            // Notify that we saved.
            console.log('friend removed');
            callback();
        });
    });
}

var saveNewFriendsToStorage = function(newFriends, callback) {
    newFriends.reverse();
    chrome.storage.sync.get(['shimmy_friends_data', 'shimmy_friends'], function(result) {
        console.log("result from storage get");
        console.log(result);

        var friends_data = result.shimmy_friends_data;
        var friends = result.shimmy_friends
        // console.log(friends);
        // friends_data = null;
        // friends = null;

        var changesMade = 0;
        if (!friends) {
            friends = [];
            friends_data = {};
            changesMade = 0;
        }

        for (var i in newFriends) {
            friend = newFriends[i];
            // console.log(friend);
            if (friends.indexOf(friend.name) == -1) {
                console.log(friend);
                friends.push(friend.name);
                var id = String(friends.indexOf(friend.name));
                friends_data[id] = friend;
                changesMade += 1;
            }
        }
        if (changesMade > 0) {
            chrome.storage.sync.set({shimmy_friends_data : friends_data, shimmy_friends : friends}, function() {
                // Notify that we saved.
                console.log('friends saved');
                callback(changesMade);
            });
        } else {
            callback(changesMade);
        }
        
    });

}





/*
    REMINDER BUSINESS LOGIC
*/ 

var setupReminders = function() {
    addConvoChangeListener();
    addConversationListListener();

    loadRemindersPanel();
}

var incrementRemindersNotification = function(num) {
    //declare default value
    num = num || 1;
    remindersNotification += num;
    updateRemindersNotification(remindersNotification);
}

var decrementRemindersNotification = function(num) {
    //declare default val
    num = num || 1;
    remindersNotification -= num;
    updateRemindersNotification(remindersNotification);
}

var clearRemindersNotification = function() {
    remindersNotification = 0;
    updateRemindersNotification(remindersNotification);
}


/*
    REMINDER DOM INTERACTION
*/

var removeReminder = function(element) {
    console.log("removing " + $(element).attr('convo'));
    removeReminderFromStorage($(element).attr('convo'), function() {
        loadRemindersPanel();
        iterateConvoList();
    });
    // decrementRecentFriendsNotification();
}

var addReminderBox = `
<div id="add_reminder_box" convo="stephen.song.4">
    <div class="button add_reminder_button">Create Reminder for this Convo</div>
</div>
`;
var insertAddReminderOrCancelReminder = function() {
    $('#add_reminder_box').remove();
    $('.whitespace').remove();
    addAddReminderBox();
}

var addAddReminderBox = function() {
    waitForMessages(function() {
        $('div[aria-label="New message"]').prepend(addReminderBox);
        $('div[aria-label="Messages"]').append(whitespace);
        // $('div[aria-label="Messages"]').animate({scrollTop: $('div[aria-label="Messages"]').height}, 'slow');
    });
}

var reminderHandler = function() {
    console.log("handler caught");
}

var conversationList;

var addConversationListListener = function() {
    conversationList = $('ul[aria-label="Conversation List"]');
    iterateConvoList();

    //add a listener that sends an iterator
    var observer = new MutationObserver(function(mutations, observer) {
        if ($(conversationList).siblings().last().children().first().is('a')) {
            iterateConvoList();
        }
    });

    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe($(conversationList)[0], {
      subtree: true,
      attributes: true
    });
    //the iteerator adds a class to each one that has a reminder possibly a specification of how many reminders
    //when the specification is added, that one appears in a way that expresses it's a reminder convo
}

var clickAddReminder = function() {
    alertify
        .defaultValue("Reach out to " + currentConvoName + ".")
        .prompt("Add a note to your reminder with " + currentConvoName + ".",
        function (val, ev) {
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();

            saveReminderToStorage(currentConvo, val, currentConvoName, function() {
                loadRemindersPanel();
                iterateConvoList();
                switchToReminders();
            });
        }, function(ev) {
            //they presed cancel
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();
        });
}

var buildReminderCard = function(reminder) {
    var reminderCard = '<div class="reminder_card card">';
    reminderCard += '<div class="reminder_note" title="' + reminder.note + '">' + reminder.note + '</div>';
    reminderCard += '<div class="reminder_link">';
    reminderCard += '<a class="reminder_message" title="Send a FB message to ' + reminder.name + '"href="https://www.messenger.com/t/' + reminder.convo + '">' + reminder.name + '</a>';
    reminderCard += '<div class="reminder_remove_icon" title="Remove this reminder" convo="' + reminder.convo + '">X</div>';
    reminderCard += '</div>';
    reminderCard += '</div>';
    return reminderCard;
}

var loadRemindersPanel = function() {
    clearRemindersContainer();
    clearRemindersNotification();
    getDateSortedReminders(function(reminders) {
        for (var i in reminders) {
            var reminder = reminders[i];
            var reminderCard = buildReminderCard(reminder);
            addToStartOfReminders(reminderCard);
            incrementRemindersNotification();
        }
        if (reminders.length > 0) {
            switchToReminders();
        }
    });
}

var addToStartOfReminders = function(card) {
    $("#reminders_container").children().first().after(card);
}


var iterateConvoList = function() {
    console.log("iterateConvo");
    $(conversationList).children().each(function() {
        var thisPanel = this;
        var url = $(this).find('a').first().attr('href');
        var convo = url.replace('https://www.messenger.com/t/', '');
        // console.log(convo);
        getReminderFromStorage(convo, function(reminder) {
            if (reminder) {
                console.log($(thisPanel));
                $(thisPanel).addClass('has_reminder');
            } else {
                $(thisPanel).removeClass('has_reminder');
            }
        });
    });
}

var currentConvo;
var currentConvoName;

var addConvoChangeListener = function() {
    var url = window.location.href;
    currentConvo = url.replace('https:\/\/www\.messenger\.com\/t\/','');
    currentConvo = currentConvo.replace('http:\/\/www\.messenger\.com\/t\/','');

    currentConvoName = $('div[role="main"]').find('span').eq(1).text();

    handleNewConvo();

    var observer = new MutationObserver(function(mutations, observer) {
        // console.log("mutation");
        var url = window.location.href;
        var convo = url.replace('https:\/\/www\.messenger\.com\/t\/','');
        convo = convo.replace('http:\/\/www\.messenger\.com\/t\/','');
        
        if (currentConvo != convo) {
            currentConvo = convo;
            currentConvoName = $('div[role="main"]').find('span').eq(1).text();
            // console.log(currentConvo);
            handleNewConvo();
        }
    });

    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe($(infoPanel)[0], {
      subtree: true,
      attributes: true
    });
}

var handleNewConvo = function() {
    console.log(currentConvo);
    insertAddReminderOrCancelReminder();
    // insertReminder();
}

// var buildReminder = function(message, time) {
//     var reminder = `
//     <div class="reminder">
//         <span class="reminder_text">Reminder: Talk to Greg</span>
//         <div class="reminder_remove_icon" name="Clint Garn">X</div>
//     </div>
//     `;
//     return reminder;
// }

// var insertReminder = function() {
//     var reminder = buildReminder();
//     // $('div[aria-label="Messages"]').waitUntilExists(function() {
//     waitForMessages(function() {
//         console.log("appending");
//         $('div[aria-label="Messages"]').append(reminder);
//         // $('div[aria-label="Messages"]').animate({scrollTop: $('div[aria-label="Messages"]').height + 75}, 'slow');
//     });
// }
var whitespace = `
<div class="whitespace"></div>
`;


var addWhiteSpace = function() {
    waitForMessages(function() {
        $('div[aria-label="Messages"]').append(whitespace);
        $('div[aria-label="Messages"]').animate({scrollTop: $('div[aria-label="Messages"]').height + 30}, 'slow');
    });
}

var waitForMessages = function(callback) {
    if ($('div[aria-label="Messages"]').size() != 0) {
        callback();
    } else {
        var messagesObserver = new MutationObserver(function(mutations) {
            if ($('div[aria-label="Messages"]').size() != 0) {
                messagesObserver.disconnect();
                callback();
            }
        });

        messagesObserver.observe(document.body, {
            childList: true
          , subtree: true
          , attributes: false
          , characterData: false
        });
    }
}

var updateRemindersNotification = function(num) {
    console.log(num);
    $('#reminders_noti').text(String(num));
}


/*
    REMINDER STORAGE INTERACTIONS
*/

var getReminderFromStorage = function(convo, callback) {
    chrome.storage.sync.get('shimmy_reminders', function(result) {
        var reminders = result.shimmy_reminders;

        if (!reminders) {
            reminders = {};
        }

        callback(reminders[convo]);
    });
}

var saveReminderToStorage = function(convo, note, name, callback) {
    chrome.storage.sync.get('shimmy_reminders', function(result) {
        var reminders = result.shimmy_reminders;

        console.log('result');
        console.log(result);

        if (!reminders) {
            reminders = {};
        }
        var reminder = {note : note, name : name, convo : convo, created_at : Date.now()};
        reminders[convo] = reminder;

        chrome.storage.sync.set({shimmy_reminders : reminders}, function() {
            // Notify that we saved.
            console.log('reminder saved');
            callback();
        });
    });
}

var getDateSortedReminders = function(callback) {
    chrome.storage.sync.get('shimmy_reminders', function(result) {
        var remindersJson = result.shimmy_reminders;
        if (!remindersJson) {
            remindersJson = {};
        }
        console.log(remindersJson);
        var remindersArray = [];
        for (var key in remindersJson) {
            var value = remindersJson[key];
            if (value) {
                remindersArray.push(value);
            }
        }
        callback(remindersArray.sort(sortByCreatedAt));
    });
}

function sortByCreatedAt(a, b) {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

var removeReminderFromStorage = function(convo, callback) {
    chrome.storage.sync.get('shimmy_reminders', function(result) {
        var reminders = result.shimmy_reminders;
        
        if (!reminders) {
            reminders = {};
        }

        reminders[convo] = false;
        chrome.storage.sync.set({shimmy_reminders : reminders}, function() {
            // Notify that we saved.
            console.log('reminder removed');
            callback();
        });
    });
}






$(document).ready(loadShimmy);

// System.WebForms.PageRequestManager.getInstance().add_endRequest(loadShimmy);

