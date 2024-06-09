var ws;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Retrieve the variables from chrome storage
    chrome.storage.local.get(['userId', 'channelId', 'guildId', 'url', 'api', 'apiKey'], function (result) {
        console.log('Api Url ist: ' + result.api);
        var apiUrl = result.api + '/play';
        var success = true;

        if(ws && ws.readyState === 1) {
            ws.close();
            console.log('WebSocket connection closed');
        }
        // Parse the API URL and modify it for the WebSocket
        var urlObj = new URL(result.api);
        if (urlObj.hostname === 'localhost' && urlObj.port === '3000') {
            urlObj.port = '3010';
        } else {
            urlObj.protocol = 'ws:';
            urlObj.port = '3010';
        }
        var wsUrl = urlObj.toString();

        ws = new WebSocket(wsUrl);
        console.log('WebSocket connection created');

        ws.onmessage = (event) => {
            const song = JSON.parse(event.data);
            console.log('New song:', song);
            chrome.runtime.sendMessage({ song: song });
        };
        ws.onopen = () => {
            ws.send(result.guildId);
        };

        // Send a message with the status 'Loading'
        chrome.runtime.sendMessage({ status: 'Loading' });
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "userid": result.userId,
                "channelid": result.channelId,
                "guildid": result.guildId,
                "song": result.url,
                "apiKey": result.apiKey
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
                if (success) {
                    chrome.runtime.sendMessage({ status: 'Success' });
                    sendResponse({ status: 'Success' }); // Call sendResponse here
                } else {
                    chrome.runtime.sendMessage({ status: 'Error' });
                    sendResponse({ status: 'Error' }); // Call sendResponse here
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Send a message with the status
                chrome.runtime.sendMessage({ status: 'Error' });
                sendResponse({ status: 'Error' }); // Call sendResponse here
            });
    });

    return true; // Indicate that you will call sendResponse asynchronously
});
