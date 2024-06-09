document.addEventListener('DOMContentLoaded', function () {
    // Retrieve the variables from chrome storage
    chrome.storage.local.get(['userId', 'channelId', 'guildId', 'api', 'apiKey'], function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            document.getElementById('userId').value = result.userId || '';
            document.getElementById('channelId').value = result.channelId || '';
            document.getElementById('guildId').value = result.guildId || '';
            document.getElementById('api').value = result.api || '';
            document.getElementById('apiKey').value = result.apiKey || '';
            var apiUrl = result.api + '/now-playing/' + result.guildId;
            fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "userid": result.userId,
                    "channelid": result.channelId,
                    "guildid": result.guildId,
                    "song": result.url,
                    "apiKey": result.apiKey
                },
            }).then(response => response.json()) // Parse the response as JSON
                .then(data => {
                    // Assuming 'data' is an object with a 'title' property
                    var videoId = getVideoId(data.url);
                    document.getElementById('thumbnail').src = 'https://img.youtube.com/vi/' + videoId + '/0.jpg';
                    document.getElementById('thumbnail').style.display = '' // Make the thumbnail visible
                    document.getElementById('now-playing').textContent = data.title;
                })
                .catch(error => console.error('Error:', error));
                
        }
    });


    document.getElementById('apiForm').addEventListener('submit', function (e) {
        e.preventDefault();

        var userId = document.getElementById('userId').value;
        var channelId = document.getElementById('channelId').value;
        var guildId = document.getElementById('guildId').value;
        var url = '';
        var api = document.getElementById('api').value;
        var apiKey = document.getElementById('apiKey').value;
        
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            url = tabs[0].url; // Removed 'var' to use the 'url' variable from the outer scope
            chrome.runtime.sendMessage({ url: url });

            // Save the variables to chrome storage
            chrome.storage.local.set({ userId: userId, channelId: channelId, guildId: guildId, url: url, api: api , apiKey: apiKey}, function () {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                } else {
                    console.log('Values are stored. UserId: ' + userId + ', ChannelId: ' + channelId + ', GuildId: ' + guildId + ', URL: ' + url + ', API: ' + api + ', APIKEY: ' + apiKey);
                }
            });
        });
    });

    document.getElementById('savePreset').addEventListener('click', function () {
        var presetName = prompt("Enter a name for this preset");
        if (presetName) {
            var preset = {
                api: document.getElementById('api').value,
                userId: document.getElementById('userId').value,
                channelId: document.getElementById('channelId').value,
                guildId: document.getElementById('guildId').value,
                apiKey: document.getElementById('apiKey').value
            };
            chrome.storage.local.get({ presets: {} }, function (result) {
                result.presets[presetName] = preset;
                chrome.storage.local.set({ presets: result.presets }, function () {
                    loadPresets();
                });
            });
        }
    });

    document.getElementById('presetSelect').addEventListener('change', function () {
        var presetName = this.value;
        document.getElementById('deletePreset').disabled = !presetName;
        chrome.storage.local.get({ presets: {} }, function (result) {
            if (result.presets[presetName]) {
                var preset = result.presets[presetName];
                document.getElementById('api').value = preset.api;
                document.getElementById('userId').value = preset.userId;
                document.getElementById('channelId').value = preset.channelId;
                document.getElementById('guildId').value = preset.guildId;
                document.getElementById('apiKey').value = preset.apiKey;
            }
        });
    });

    document.getElementById('deletePreset').addEventListener('click', function () {
        var presetName = document.getElementById('presetSelect').value;
        if (presetName) {
            if (confirm('Are you sure you want to delete this preset?')) {
                chrome.storage.local.get({ presets: {} }, function (result) {
                    delete result.presets[presetName];
                    chrome.storage.local.set({ presets: result.presets }, function () {
                        document.getElementById('deletePreset').disabled = true;
                        loadPresets();
                    });
                });
            }
        }
    });


    function loadPresets() {
        chrome.storage.local.get({ presets: {} }, function (result) {
            var select = document.getElementById('presetSelect');
            select.innerHTML = '<option value="">Select a preset</option>';
            for (var presetName in result.presets) {
                var option = document.createElement('option');
                option.value = presetName;
                option.textContent = presetName;
                select.appendChild(option);
            }
        });
    }


    loadPresets();

    // Listen for messages from the background page
    chrome.runtime.onMessage.addListener(function (message) {
        if (message.status === 'Success') {
            document.getElementById('statusMessage').style.color = 'green';
            document.getElementById('statusMessage').textContent = 'Success';
        } else if (message.status === 'Error') {
            document.getElementById('statusMessage').style.color = 'red';
            document.getElementById('statusMessage').textContent = 'Error';
        }
        else if (message.status === 'Loading') {
            document.getElementById('statusMessage').style.color = 'white';
            document.getElementById('statusMessage').textContent = 'Loading';
        }
        if (message.song) {
            // Display the song data in your popup
            var videoId = getVideoId(message.song.url);
            document.getElementById('thumbnail').src = 'https://img.youtube.com/vi/' + videoId + '/0.jpg';
            document.getElementById('thumbnail').style.display = ''
            document.getElementById('now-playing').textContent = message.song.title;
            console.log('Song data received:', message.song);
        }
    });

    //close websocket connection when popup is closed
    window.onunload = window.onbeforeunload = function() {
        if (ws) {
            ws.close();
            console.log('WebSocket connection closed');
        }
    }
});



function getVideoId(url) {
    var video_id = url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if (ampersandPosition !== -1) {
        video_id = video_id.substring(0, ampersandPosition);
    }
    return video_id;
}