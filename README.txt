Install NODE
Install MONGODB(for test/dev as local mongodb server needed)
need to install homebrew and xcode-install for mac
git clone to get updated code/files
npm install to install all packages
npm install for devdependecies such as nodemon,morgan,jest,debug(if not already installed)

npm run test for locally testing files and coverage to see report
npm run dev for running in dev mode using nodemon and debug
npm run start for running no debug and no nodemon and set production so that helmet runs and also different db to be used

beware of set/export word 
And a extra app.env for setting our secret
Git Main Branch to side Branch for non dev/test +app.env
As per env config is used but hide either by terminal or app.env

First dev
Along test
Then start
Then git to side branch to app.env
Then postman test