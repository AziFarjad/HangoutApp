# ReColl

## Getting Started
- The following page explains Leila's research work at CSIRO: [page](http://www.csiro.au/en/Research/DPF/Areas/Autonomous-systems/Guardian/ReMoTe)

- Here are some [videos](https://drive.google.com/a/thoughtworks.com/folderview? id=0B6DHptoy2KCIfk04R3A0b1RuNkhaRGVJV1JVdzBYQklJLUp6TXlGUFdhbXEtNDhVcHpZOFE&usp=sharing) on the topic

- [Trello board](https://trello.com/b/4rG5eFH8/remote-expert) for the prototype/MVP

- The latest version of the prototype can be viewed at [http://remote-expert.herokuapp.com/remote-expert.html](http://remote-expert.herokuapp.com/remote-expert.html)

- Here are some links to WebRTC and the p2p library used in the project:

[http://www.webrtc.org/](http://www.webrtc.org/)


[http://peerjs.com/](http://peerjs.com/)

## Developer Quick Start Guide


- Use the IDE of your choice to edit the code. Atom was used by the initial developers, but any thing like Sublime, WebStorm, ... should be fine.
- Install node.js
- Clone this repo: [https://github.com/AziFarjad/HangoutApp](https://github.com/mattrcarter/HangoutApp)
- After getting the code from GitHub here is how you run the node.js app on your local machine

### install
Go to directory of the code you got from Github

```
npm install
```
```
node server.js
```
### usage
Now try [http://localhost:3000/](http://localhost:3000/) to see the prototype in action.

## See it on Heroku
After committing any changes to master, you can push to Heroku for all others to see. First you need to [set up Heroku as a git remote](https://devcenter.heroku.com/articles/git#creating-a-heroku-remote).

Then push to Heroku:
[Getting Started with Heroku](https://dashboard.heroku.com/apps/remote-expert/deploy/heroku-git)

## PeerJS configuration

### Custom Peer server

A custom server was set up to allow SSL: recoll-peer-server.herokuapp.com

### STUN and TURN servers
xirsys.com (currently a free dummy account used)
STUN and TURN servers added in order to be able to serve clients who are behind NAT.

### Owners of the assets
Git repository: Matt Carter
Heroku app: Azi Farjad
Peer server at Heroku: Katia Bondar
xirsys.com account (STUN and TURN servers): Katia Bondar
[myThoughtWorks group:](https://thoughtworks.jiveon.com/groups/recoll-remote-collaboration-solutions): Leila Alem, Nikki Foster
