chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Retrieve the variables from chrome storage
    chrome.storage.local.get(['userId', 'channelId', 'guildId', 'url', 'api'], function(result) {
        console.log('Api Url ist: ' + result.api);
        var apiUrl = result.api + '/play';
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userid": result.userId,
          "channelid": result.channelId,
          "guildid": result.guildId,
          "song": result.url
        },
        body: JSON.stringify({url: result.url})
      })
      .then(response => response.text())
      .then(responseText => {
        console.log(responseText);
        console.log(result.userId + " " + result.channelId + " " + result.guildId + " " + result.url);
        // Handle the response from the API call
      })
      .catch(error => console.error('Error:', error));
    });
  });