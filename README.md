# A terrible private proxy
I made this for use with (Proxy SwitchyOmega)[https://chrome.google.com/webstore/detail/padekgcemlokbadohgkifijomclgjgif] which is yet to allow user - password socks v5 proxys

## Adding users
In users.json
```json
{}
```
Adding 1 user:
```json
{
    "user1":"pass1"
}
```
Adding a second:
```json
{
    "user1":"pass1",
    "user2":"pass2"
}
```

## Install
Copy:
```
index.js
users.json
auth.html
node_modules/
```

Then launch using:
```
node index.js
```