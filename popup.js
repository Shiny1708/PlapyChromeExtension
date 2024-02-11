document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the variables from chrome storage
    chrome.storage.local.get(['userId', 'channelId', 'guildId', 'api'], function(result) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        document.getElementById('userId').value = result.userId || '';
        document.getElementById('channelId').value = result.channelId || '';
        document.getElementById('guildId').value = result.guildId || '';
        document.getElementById('api').value = result.api || '';
      }
    });
  
    document.getElementById('apiForm').addEventListener('submit', function(e) {
      e.preventDefault();
    
      var userId = document.getElementById('userId').value;
      var channelId = document.getElementById('channelId').value;
      var guildId = document.getElementById('guildId').value;
      var url = '';
      var api = document.getElementById('api').value;
  
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        url = tabs[0].url; // Removed 'var' to use the 'url' variable from the outer scope
        chrome.runtime.sendMessage({url: url});
  
        // Save the variables to chrome storage
        chrome.storage.local.set({userId: userId, channelId: channelId, guildId: guildId, url: url, api: api}, function() {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log('Values are stored. UserId: ' + userId + ', ChannelId: ' + channelId + ', GuildId: ' + guildId + ', URL: ' + url + ', API: ' + api);
          }
        });
      });
    });
  });