# Parse-Server-Example


<h2>This is an example of a Node.js app running on Express where the two main components are Parse Dashboard and Parse Server.</h2>



A few weeks ago I wrote a blog post titled "A letter to younger me". It had a few thoughts about programming practices I could handle better, bad habits and dangerous shortcuts that- in my opinion- most young programmers fall into. This week I would like to write about my recent accomplishment with Parse Server. If nothing more, this post will be a good way for me to go over all the steps I took to set up my server and connect Parse with the iOS app I'm working on. I'm sure sooner or later I will need it. The good thing about this tutorial is that with a slight modifications, it can be used to run Parse Server or any Linux based hosting environment.

Before I go through all the steps necessary for the setup, lets talk about a few prerequisites and the final setup.
<h3>What's needed:</h3>
<ul>
 	<li>Ubuntu 16.04 LTE Server running on a VPS. You will need an SSH access to the server.</li>
 	<li>Dedicated domain that is pointed to the server. The DNS update might take some time so be patient.</li>
 	<li>Linode account for your VPS- Linode isn't necessary since you can use any other hosting provider. Here is a coupon code from Core Intuition that should help. - Coreint20</li>
 	<li>MongoDB database for your backend data. (I use MongoLab).</li>
</ul>
<h3>The end result:</h3>
We will end up with a fully functional Parse Server that will act as a connection between our iOS (or Android) app and the MongoDB Database.
<h2>Create a new server image and configure your domain.</h2>
The first step is to sign up or login to your Linode account and create a new Linode. You will have to deploy new image and for the sake of this tutorial, lets use Ubuntu 16.04. Once the setup completes, head to "DNS Manager" and configure DNS information for your server. You will add a new "Domain Zone" with the domain name you bought for this purpose and let Linode Manager insert default records. Once you have this part taken care off, head to your domain registrar and configure DNS values to point to Linode servers. In my case it is ns1.linode.com and ns2.linode.com.

If you want to take a full advantage of Parse Server, you will want to create a Mailgun account and configure it to work with your Linode Server too. We will use Mailgun later on for lost password retrieval. The Linode's DNS Manager is the place to set up Mailgun to work with the instance of your server. We I might cover it in another tutorial.
<h2>Server Setup and Parse configuration.</h2>
Once you have your server configured and booted, log in to it though the SSH (if you're on your Mac, use your terminal and you will find an ssh command in "Remote Access" tab in Linode's Dashboard. You will also find your IP address over there.)

Update the server and all its software with an "update" command.

<pre id="terminal" user="root">
 sudo apt-get update
</pre>

We upgrade the server and its software with an "upgrade" command.
<pre id="terminal" user="root">
sudo apt-get upgrade
</pre>


There will be a few software packages we will need to get from GitHub. In order to do that, lets install git on our server. We will also install bc packages:
<pre id="terminal" user="root">
sudo apt-get -y install git bc
</pre>

Finally, we will install Node.js and Ngnix server so everything can run correctly.

Ubuntu 16.04 comes with a pretty conservative/old version of Node so we need to grab something newer. I installed node 6 and you can find it in here: <a href="https://nodejs.org/en/download/package-manager/" target="_blank">nodejs.org</a>
<pre id="terminal" user="root">
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
</pre>
By the time you're reading this tutorial, Node version and Parse requirements might change.

&nbsp;
<h2>SSL Certificate installation</h2>
Parse Dashboard and the iOS9 requires that all connections with the backend are encrypted. In order to secure our server, we will need to add an SSL key and configure our server to work with https requests. The first step is to get a free SSL certificate from Letsencrypt. In order to do that, we will download their package hosted on git. We will place it in /opt/letsencrypt

<pre id="terminal" user="root">
sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt
</pre>

Once this step finishes, go to the letsencrypt directory you just created.
and install letsenctrypt by running their script.

<pre id="terminal" user="root">
cd /opt/letsencrypt
</pre>
<pre id="terminal" user="root">
./letsencrypt-auto certonly --standalone
</pre>

Once you finish the installation, you will be able to find your certificates in /etc/letscenrypt/your_domain/

The Letsencrypt SSL part of my tutorial was originally found at <a href="https://www.digitalocean.com/community/tutorials/how-to-migrate-a-parse-app-to-parse-server-on-ubuntu-14-04" target="_blank">digitalOcean</a> and you will find more information about the certificate renewal or more advanced setup if you head to their article.

<h2>Nginx server installation and setup</h2>
Once we have Node installed on our box, we will need to install a Nginx server that will handle the traffic between our browser/iOS app. We can do that with this command:

<pre id="terminal" user="root">
sudo apt-get install -y nginx
</pre>

Once the installation finishes, Nginx needs to be configured. We will do that by modifying a 'default' file. You can open it with this command:
<pre id="terminal" user="root">
sudo nano /etc/nginx/sites-enabled/default
</pre>
I use nano to edit the file. If you're more comfortable with Vim or other editors, that will work as well.
If this is your first time with nano, use ctrl+k to remove lines your coursor is currently on. Save your file with the ctrl+x combination, hit 'y' or 'n' depending if you want to save your changes and approve once again by hitting 'Enter'

Below is the modified "nginx" configuration you should use:

https://gist.github.com/mlichwa/42c3b94613ca2fccd3c401068c16e141

Once you modify (Replace your_domain with the name of your domain) this file and save it, we will grab my sample app from github and start with Parse Server and Parse Dashboard.
<h2>Parse Server and Parse Dashboard within one app.</h2>
We went through the whole setup to prepare our server for a nodejs app that will run our Parse Server and let us control the data through a Dashboard. Ideally, with more development time, nodejs would be great to leverage some of the Parse API's and create a Web App.

We will start by creating a new user that won't have sudo privileges and in case of an attack on our app, the server will remain safe.
<pre id="terminal" user="root">
sudo useradd --create-home --system serveradmin
</pre>


We need to set a password for our new user.

<pre id="terminal" user="root">
sudo passwd serveradmin
</pre>

Once done, we switch to our newly created user by typing:
<pre id="terminal" user="root">
sudo su serveradmin
</pre>

now, we switch to the home directory for our new user:
<pre id="terminal" user="serveradmin">
cd ~
</pre>

<h2>Leave the terminal, lets prepare our Node project.</h2>

After creating new user that will be used to run our Node app, we need make sure that the project has all necessary configuration. In your browser, head to:

https://github.com/mlichwa/Parse-Server-Example

and clone it. You will need to have your own copy of the project without all the temporary values in it. The file that needs to be modified is the <strong>app.js</strong>. The file has all necessary comments so you know what's going on. In case of any problems, head to the <a href="https://github.com/ParsePlatform/parse-server" target="_blank">parse-server</a> or <a href="https://github.com/ParsePlatform/parse-dashboard" target="_blank">parse-dashboard</a> repositories on GitHub.

Once you are done configuring your app.js, you will need to upload the whole project to your server. The best way to do it is through cloning it from GitHub to your Linode server. I will explain all the steps by using the example project. You have to use the one you configured yourself.

<h2>Back to the terminal window</h2>

We will use our open ssh terminal window we left out a few steps ago. Last time we've used it, we had it using our serveradmin user and pointing to its home directory. In order to clone your project, use

<pre id="terminal" user="serveradmin">
git clone http://github.com/mlichwa/parse-server-example parseserver
</pre>
This command will clone my parse-server-project to a newly created folder called parseserver.

The next step is to change directory, install all necessary node modules and then run the app.

Change directory to parseserver.
<pre id="terminal" user="serveradmin">
cd parseserver
</pre>

Install all necessary modules.
<pre id="terminal" user="serveradmin">
npm install
</pre>

Run your Node app with the help of pm2. Pm2 will make sure that this process runs all the time without interruptions.
<pre id="terminal" user="serveradmin">
pm2 start app.js
</pre>

In order to test that the app is running, you can use <strong>pm2 list</strong> command that will list all running node apps.

We will save all running processes to a file:
<pre id="terminal" user="serveradmin">
pm2 save
</pre>

This process will be saved to a <strong>/home/serveradmin/.pm2</strong> file and we will use it later on to make sure that its running every time the server reboots. Also, this process will be run by our serveradmin user and not root which means that even if someone wants to attack our Node App, they won't take down the whole server.

Now, to make sure that our Node app restarts every time the server reboots or restarts, we need to create a startup script. First, exit the serveradmin user by typing:
<pre id="terminal" user="serveradmin">
serveradmin exit
</pre>  
That will take you back to the root user and now, execute this command in order to create a startup script.
<pre id="terminal" user="root">
sudo pm2 startup ubuntu -u serveradmin --hp /home/serveradmin/
</pre> 

And now restart the server to see your new app running.
<pre id="terminal" user="root">
sudo reboot
</pre> 

You will be able to find your parse server by going to:
http://yourdomain.com/parse/server

and the Parse Dashboard can be found under:
http://yourdomain.com/parse/dashboard
