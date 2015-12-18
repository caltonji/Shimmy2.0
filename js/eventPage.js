chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.method == 'GET') {
    //     $.ajax({
    //         type: "GET",
    //         method: "GET",
    //         url: request.url,
    //         success: function(result) { 
    //             callback(result);
    //         }
    //     });
    //     return true;

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", callback);
    oReq.open("GET", request.url);
    oReq.send();
    }
});