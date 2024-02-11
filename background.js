chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Retrieve the variables from chrome storage
    chrome.storage.local.get(['userId', 'channelId', 'guildId', 'url', 'api'], function (result) {
        console.log('Api Url ist: ' + result.api);
        var apiUrl = result.api + '/play';
        var success = true;

        // Send a message with the status 'Loading'
        chrome.runtime.sendMessage({ status: 'Loading' });
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "userid": result.userId,
                "channelid": result.channelId,
                "guildid": result.guildId,
                "song": result.url
            },
            body: JSON.stringify({ url: result.url })
        })
            .then(response => {
                if (!response.ok) {
                    success = false;
                }
                return response.text();
            })
            .then(responseText => {
                console.log(responseText);
                console.log(result.userId + " " + result.channelId + " " + result.guildId + " " + result.url);
                // Handle the response from the API call
                // Send a message with the status
                if(success){
                    chrome.runtime.sendMessage({ status: 'Success' });
                    sendResponse({status: 'Success'}); // Call sendResponse here
                } else {
                    chrome.runtime.sendMessage({ status: 'Error' });
                    sendResponse({status: 'Error'}); // Call sendResponse here
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Send a message with the status
                chrome.runtime.sendMessage({ status: 'Error' });
                sendResponse({status: 'Error'}); // Call sendResponse here
            });
    });

    return true; // Indicate that you will call sendResponse asynchronously
});