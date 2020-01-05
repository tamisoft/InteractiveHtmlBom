var extStorageConnected = false;
var s3;
var importedData = '';
var extStorageSaveTimer;

function setExtStorageHost(aws_host) {
    console.log('EXT Storage Host: ' + aws_host);
    writeStorage("extStorageHost", aws_host);
    settings.extStorageHost = aws_host;
    redrawIfInitDone();
}

function setExtStorageAccessKeyID(aws_access_key_id) {
    console.log('EXT Storage AccessKey ID: ' + aws_access_key_id);
    writeStorage("extStorageAccessKeyID", aws_access_key_id);
    settings.extStorageAccessKeyID = aws_access_key_id;
    redrawIfInitDone();
}

function setExtStorageSecretKey(aws_secret_key) {
    console.log('EXT Storage Secret Key: ' + aws_secret_key);
    writeStorage("extStorageSecretKey", aws_secret_key);
    settings.extStorageSecretKey = aws_secret_key;
    redrawIfInitDone();
}

function setExtStorageForcePathStyle(aws_force_path_style) {
    console.log('EXT Storage Force Path Style: ' + aws_force_path_style);
    writeStorage("extStorageForcePathStyle", aws_force_path_style);
    settings.extStorageForcePathStyle = aws_force_path_style;
    redrawIfInitDone();
}

function setExtStorageAutoSave(aws_auto_save) {
    console.log('EXT Storage Auto Save: ' + aws_auto_save);
    writeStorage("extStorageForcePathStyle", aws_auto_save);
    settings.extStorageAutoSave = aws_auto_save;
    if (extStorageConnected) {
        if ((!aws_auto_save) && (typeof extStorageSaveTimer === 'number')) {
            console.log('Stopped auto-save');
            clearInterval(extStorageSaveTimer);
            extStorageSaveTimer = undefined;
            extStorageSaveSettings();
        }else{
            if ((aws_auto_save) && (typeof extStorageSaveTimer !== 'number')) {
                console.log('Started auto-save');
                extStorageSaveSettings();
            }
        }
    } else {
        console.log('Skipped saving, load was not performed yet');
    }
    redrawIfInitDone();
}

function extStoragePutObject(bucket, key, data) {
    var params = {Bucket: bucket, Key: key, Body: data};

    s3.putObject(params, function(err, data) {
        if (err)
            console.log(err)
        else
            console.log("Successfully uploaded data to " + bucket + "/" + key);
    });
}

function extStorageSaveSettings() {
    var data = {
        type: "InteractiveHtmlBom settings",
        version: 1,
        pcbmetadata: pcbdata.metadata,
        settings: settings,
    }
    var blob = new Blob([JSON.stringify(data, null, 4)], {type: "application/json"});
    if (extStorageConnected) {
        console.log("S3 is connected saving blob");
    }else{
        if (settings.extStorageHost === "") {
            console.log("No S3 host defined in settings");
            alert("Set S3 parameters in settings first.");
            return;
        }else{
            extStorageConnect();
        }
    }
  var date = new String(pcbdata.metadata.date);
  date = date.replace(/[^a-zA-Z 0-9]+/g,'').replace(/ /g,'_');
  extStoragePutObject('iboms',`${pcbdata.metadata.title}_${date}/${pcbdata.metadata.title}.settings.json`, blob);
}

function extStorageLoadSettings() {
    if (!extStorageConnected) {
        extStorageConnect();
    }
    importedData = '';

    var date = new String(pcbdata.metadata.date);
    date = date.replace(/[^a-zA-Z 0-9]+/g,'').replace(/ /g,'_');

    var params = {Bucket: 'iboms', Key: `${pcbdata.metadata.title}_${date}/${pcbdata.metadata.title}.settings.json`};

    s3.getObject(params).
    on('httpData', function(chunk) { importedData += chunk; }).
    on('httpDone', function() {
      var content = importedData;
      var newSettings;
      try {
        newSettings = JSON.parse(content);
      } catch(e) {
        alert("Selected file is not InteractiveHtmlBom settings file.");
        return;
      }
      if (newSettings.type != "InteractiveHtmlBom settings") {
        alert("Selected file is not InteractiveHtmlBom settings file.");
        return;
      }
      var metadataMatches = newSettings.hasOwnProperty("pcbmetadata");
      if (metadataMatches) {
        for (var k in pcbdata.metadata) {
          if (!newSettings.pcbmetadata.hasOwnProperty(k) || newSettings.pcbmetadata[k] != pcbdata.metadata[k]) {
            metadataMatches = false;
          }
        }
      }
      if (!metadataMatches) {
        var currentMetadata = JSON.stringify(pcbdata.metadata, null, 4);
        var fileMetadata = JSON.stringify(newSettings.pcbmetadata, null, 4);
        if (!confirm(
          `Settins file metadata does not match current metadata.\n\n` +
          `Page metadata:\n${currentMetadata}\n\n` +
          `Settings file metadata:\n${fileMetadata}\n\n` +
          `Press OK if you would like to import settings anyway.`)) {
          return;
        }
      }
      overwriteSettings(newSettings.settings);
      console.log('Settings imported');
    }).
    send();
}

function extStorageConnect() {
    console.log('Connecting to S3');
    s3  = new AWS.S3({
          accessKeyId: settings.extStorageAccessKeyID,
          secretAccessKey: settings.extStorageSecretKey,
          endpoint: settings.extStorageHost,
          s3ForcePathStyle: settings.extStorageForcePathStyle,
          signatureVersion: 'v4'
    });
    extStorageConnected = true;
    extStorageSaveTimer = setInterval(extStorageSaveSettings, 60000);
}
