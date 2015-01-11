---
title: Introduction to Elastic Beanstalk
layout: post-page
permalink: /2015/01/12/introduction-to-elastic-beanstalk/
---
Amazon Web Services offers different scalability opportunities via autoscaling
groups and launch configurations. After the web console integration of those
services scaling virtual machines are effectively more easly but we still have
several problems like:

 * Prepare an empty image
 * Deploy new software configurations
 * More ...

Of course there are ways to solve those problems like: use the EC2 USER DATA
feature in order to prepare and empty or partially configured instance. The
problem with this approach is the script maintance (ec2 user data uses a shell
script in order to execute actions during the server boot operation).

For deploys we can use different software stacks like: Fabric or Capistrano in
order to connect to multiple VMs via SSH and execute remote commands but we
still have the dynamic selection of instances because we don't know how many
instances we have at this time (we are in auto-scaling).

We have also to solve logs collection (via the Elastic LoadBalancer could be a
simple but not complete solution, because how can we collect and analyze our
application logs at any time?

Elastic Beanstalk offers a simple and unified way in order to solve all of
previous problems using deploy hooks and app unpackaging procedures,
downloading it from S3 or using Git deploy hooks.

We will cover the "packaged deploy" from ZIP archives and not the Git approach. In
that way you can easly extends the deploy operation using your
continuous-delivery system like: Jenkins or any other hosted solution.

The base schema is prepare a ZIP archive that bundle your application and Elastic
Beanstalk will unpackage it and deploy into your application server.

Elastic Beanstalk offers several Application Containers like: Tomcat,
Apache2/PHP5, NodeJS and more but the more interesting application container is
based on Docker.io in my opinion because let to us the whole serving stack, for
example at today several people prefer to use Nginx and PHP5-fpm instead the
more common Apache2-Mod-PHP5 approach. Reprepare the default image is not so
simple in my opinion but with Docker Containers we can prepare any enviroment in
a simple and reusable way.

### Prepare our application container

Before starting with Elastic Beanstalk we have to create a Docker image that
will serve our application. We will use a simple example using the internal PHP
server in order to simplifies all operations related to Docker that are not part
of this article. Prepare a new file with name: `Dockerfile` file that contains:

{% highlight docker %}
FROM ubuntu:14.04

RUN apt-get update
RUN apt-get install -y php5-cli php5-curl php5-mysql

EXPOSE 8080

VOLUME /app
WORKDIR /app

CMD ["php", "-S", "0.0.0.0:8080", "-t", "/app"]
{% endhighlight %}

In that `Dockerfile` we are configuring the PHP5 development server on port
8080 with folder `/app` as server root directory. We enable the server port
expose and allow the volume mount point and a different working entry point.
Thanks to this configuration we can prepare our self-configured image and try it
locally:

{% highlight sh %}
docker build -t myname/myapp .
{% endhighlight %}

When the base image is ready (use the `docker images` command in order to check
it) you can try it locally with:

{% highlight sh %}
docker run -d -v `pwd`:/app -p 8080:8080 -t myname/myapp
{% endhighlight %}

In our working folder create a simple `index.php` file:

{% highlight php %}
<?php
echo "Hello World" . PHP_EOL;
{% endhighlight %}

Browse your application via browser at url `http://localhost:8080` you will see
the `Hello World` message.

### Amazon ElasticBeanstalk Docker integration

Ok, now we are ready to deploy it to Elastic Beanstalk but we can't log in every
server and expose the port and mount the application volume. For that reason we
can use an AWS configuration file, named: `Dockerrun.aws.json`

{% highlight json %}
{
  "AWSEBDockerrunVersion": "1",
  "Ports": [
    {
      "ContainerPort": "8080"
    }
  ],
  "Volumes": [
    {
      "HostDirectory": "/var/app/current",
      "ContainerDirectory": "/app"
    }
  ]
}
{% endhighlight %}

That are effectively a simple way to configure that we mount an external volume
and we are exposing a port.

### Deploy considerations

As you can see during the application deployment Elastic Beanstalk has to
prepare a new container and run it using the `Dockerfile`. That means that our
deploy depends, at runtime, on different commands but mainly on `apt` that connects
directly to ubuntu repositories and prepare the image on the fly. This implies a
couple of thigs: first of all, our deploy procedure depends on Apt repositories.
It means that if apt are not available our application can't be deployed.
Secondly, our app supports libraries, like php5-cli and others, could changes as
the `apt` repository change.

For that reasons we can limit this issues create a self-designed Docker.io image
and deploy it on the Docker repository central in order to download, at runtime,
a prepackaged and stable image. In that way our project support libraries are
stable, upgradable whenever we want via `docker push` and it can speed up our
deploy operation because we don't have to install any software at runtime.

### Try our container on Amazon Elastic Beanstalk

Now we are ready to create the first Elastic Beanstalk application and
environment. In order to do that, just open your Amazon Web Services Console and
select ElasticBeanstalk from the services list. You should see something like
this:

![AWS ElasticBeanstalk Homepage](/static/img/posts/elastic-beanstalk-1.png)

Now Elastic Beanstalk prepares the whole infrastructure: Elastic LoadBalancer,
EC2 and so on. A this point we have this situation:

 * 1 Elastic Load Balancer
 * 1 EC2 micro instance

The default Elastic Beanstalk project uses your default Virtual Private Cloud
(VPC) and connect all network pieces together. Of course you can follow a more
detailed procedure following "Create new application" link in the top right
corner and you could select all properties like: instance private keys, subnets,
a different VPC and other details.

Now we have to remember that our `Dockerfile` expose our application on port
8080 but Elastic Beanstalk create an internal proxy on every instance that forward the port 80.
For that reason our Elastic LoadBalancer should proxy port 80 to port 80 and
not to port 8080 as described in our the docker configuration file. We have to remind that if we have to
forward different ports, via `expose`, the first one is always proxied on port 80,
in Elastic Beanstalk, and all other ports remaining on declared ports.

Elastic Beanstalk can handle multiple applications and multiple environment per
applicaton. During the application\environment changes the environment is locked
until the operation finish or a timeout occurs. For example the launch operation
should be like this:

![Elastic Beanstalk launching](/static/img/posts/elastic-beanstalk-2.png)

When the project is up and in the "green" state, you should see something like:

![Elastic Beanstalk launching](/static/img/posts/elastic-beanstalk-3.png)

Now we can create our zip archive and upload via the "Upload and Deploy" button

![Elastic Beanstalk launching](/static/img/posts/elastic-beanstalk-deploy-1.png)

The version label is so useful in order to select or rollback our application at
any time. Now we have to deploy our project, for that reason we can create our
zip archive with something like:

{% highlight sh %}
zip -r myapp.zip *
{% endhighlight %}

During the "update" process the environment is locked and we should see
something like:

![Elastic Beanstalk launching](/static/img/posts/elastic-beanstalk-deploy-2.png)

When the operation finish correcly, we are able to browse our project using the
Elastic Beanstalk endpoint, something terrible like:
"`Your-Environment-Name-123456789.elasticbeanstalk.com`".

### So many features and configurations


