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
