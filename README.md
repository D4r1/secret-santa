# secret-santa
A simple webpage and scripts to organize a valid Secret Santa event

Administration
==============
1. Get the list of people who will be participating in the event
1. Generate a valid derangement (with `length` being the list length)

    Generate-Derangement.ps1 (1..$length)
1. Copy and paste the derangement in `santa.js`
1. Fill in the list information in `santa.js`
1. Open the page `santa.html` in a browser
1. ???
1. Profit!

Use
===
Users come to the page, select their name, and see their match. The secrecy only relies on the information stored in the JavaScript source code. This is by no mean a security implementation of the protocol, merely a tool.
