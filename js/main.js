var sideDoc = '<div id="ShimmyContainer" class="shimmyhidden"></div>';
var scrollable;

var options = `
	<div id="optionsholder">
		<ul class="options">
			<li class="option" id= "info_buttton">Info</li>
			<li class="option" id= "recent_friends_button">Recent Friends</li>
		</ul>
	</div>	
`;

var setup = function() {
	var container = $('div[role="main"]').children().eq(2).children().first();
	scrollable = $(container).children().first();
	$(scrollable).prepend(sideDoc);
	$(scrollable).prepend(options);
	// $("#ShimmyContainer").prepend(options);
	// $("body").children(":first").css("padding-right", "250px");
	
}



$(document).ready(function() {
	
	setup();
	// $(window).trigger('resize');
	// parseRecentFriends();
	// console.log(html);
	$.ajax({
		    url : "https://www.facebook.com/me/friends_recent",
		    success : function(result){
		    	// setup();
		    	console.log("success");
		    	// console.log(result.replace("\n", "\\"));
		    	// console.log(result);
		    	// console.log("convert to html");
		    	// html = $.parseHTML(result);
		    	// console.log(html);
		    	// console.log("starting each iterator");
		    	// $.each(html, function(i, el) {
		    	// 	console.log(el.nodeName + " : " + el);
		    	// });
				var re = /<ul class="uiList _262m _4kg" data-pnref="friends">.*<\/ul>/g;
				var friends = result.match(re)[0];
				// console.log(myArray);
				// var b = $(result);
				// var c = b.find('script');
				var friendList = $(friends).find("li");
				
				$.each(friendList, function(i, friend) {
					// console.log(friend);
					var name = $(friend).find(".uiProfileBlockContent").find('a').text();
					var url = $(friend).find("a").eq(1).attr('href');
					var imgUrl = $(friend).find("img").attr('src');
					var urlAppend = url.replace('https:\/\/www\.facebook\.com\/', '');
					var data = {name : name, urlAppend : urlAppend, imgUrl : imgUrl};
					console.log(data);
					buildCard(data, function(card) {
						// console.log(card)
						$("#ShimmyContainer").append(card);
					});

					// $("#ShimmyContainer").append(card);
				});

				addClickEvents();
				switchToInfo();
				// console.log(c.find("#pagelet_timeline_main_column").children().eq(1));
				// console.log(c.find("#pagelet_main_column_personal"));
		    	
		    },
		    error : function(result) {
		    	console.log("error");

		    }

	});
});

var addClickEvents = function() {
	$('body').on('click', '#info_buttton', function () {
	    switchToInfo();
	});
	$('body').on('click', '#recent_friends_button', function () {
	    switchToRecentFriends();
	});
	$('body').on('click', '.directMessage', function () {
		sendNewMessage($(this).attr('urlAppend'));
	});
}

var sendNewMessage = function(urlAppend) {
	
	// setTimeout(function(){ 
	// 	console.log(urlAppend);
	// 	var inputField = $('input[role="combobox"]').eq(1);
	// 	console.log($(inputField).val());
	// 	var space = jQuery.Event("keydown");
	// 	var enter = jQuery.Event("keypress");
	// 	space.which = 32; // # Some key code value
	// 	space.keycode = 32;
	// 	enter.which = 13; // # Some key code value
	// 	enter.keyCode = 13;
	// 	// $("input").trigger(e);
	// 	$(inputField).val(urlAppend + "\n");
	// 	// $(inputField).submit();
	// 	// $(document).trigger(enter);

	// }, 3000);
	// location.href = 'https://www.messenger.com/new';
}

var switchToRecentFriends = function() {
	$(scrollable).children().addClass('shimmyhidden');
	$(scrollable).find('#ShimmyContainer').removeClass('shimmyhidden');
	$(scrollable).find('#optionsholder').removeClass('shimmyhidden');
	//add underline
	$(scrollable).find('.options').children().removeClass('underline');
	$(scrollable).find('#recent_friends_button').addClass('underline');
}

var switchToInfo = function() {
	$(scrollable).children().removeClass('shimmyhidden');
	$(scrollable).find('#ShimmyContainer').addClass('shimmyhidden');
	$(scrollable).find('#optionsholder').removeClass('shimmyhidden');
	//add underline
	$(scrollable).find('.options').children().removeClass('underline');
	$(scrollable).find('#info_buttton').addClass('underline');
}


var buildCard = function(data, callback) {
	var card = '<div class="card">\n';
	card = card + '<img class="profileImg" src="' + data.imgUrl + '">\n';
	card = card + '<div class="nameholder">';
	card = card + '<a class="directMessage" href="https://www.messenger.com/new" urlAppend="' + data.urlAppend + '"> Message ' + data.name + '</a>\n';
	card = card + '</div>\n';
	card = card + '</div>';
	callback(card);
}



