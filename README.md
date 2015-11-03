## MIT GOV/LAB Website

*This is the MIT GOV/LAB website, which runs on [webhook](http://www.webhook.com).*


This document will help you set up a local development version of the website. The instructions on this page are mostly culled from Webhook's [walkthrough](http://www.webhook.com/docs/collaborative-development/) for setting up a basic version control.

#### Get a Local Copy of the Site

Make a local directory for development wherever you like with ```mkdir gov-lab``` and then run ```git clone https://github.com/work-shop/gov-lab.git ./gov-lab```.

Once the site has been cloned to your computer, `cd gov-lab` and run `wh init gov-lab`. You'll be prompted for an email and password to the gov-lab webhook account. Once you enter these, the site will be provisioned and installed.

Create a new development branch off of the `develop` branch: ```git checkout develop; git checkout -b feature-[your-branch-name]```. You're good to go: run ```wh serve``` to start your local server.