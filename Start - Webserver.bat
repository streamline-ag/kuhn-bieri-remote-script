ECHO The server needs to be started with the "kuhnbieri\administrator" user
CALL pm2 start D:\ContentisAG\SyncWORKSReports\Batch\remote-script\index.js -n remote-script --watch D:\ContentisAG\SyncWORKSReports\Batch\remote-script\config.js  
pause