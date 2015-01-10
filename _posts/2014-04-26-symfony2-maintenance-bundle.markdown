---
title: Symfony2 Maintenance Bundle
layout: post-page
excerpt: Today i released a Symfony2 bundle that handle maintenance pages. When i look for other maintenance bundles, different authors solve the problem cutting off requests using the event manager and many other PHP techniques. The problem with this approach is that effectively, we want to stop the application completely, who is telling us that the application layer is correctly working?
permalink: /2014/04/26/symfony2-maintenance-bundle/
---
Today i released a Symfony2 bundle that handle maintenance pages. When i look for other maintenance bundles, different authors solve the problem cutting off requests using the event manager and many other PHP techniques. The problem with this approach is that effectively, we want to stop the application completely, who is telling us that the application layer is correctly working?

Too many words to say that i start another project that allows me to stop a web application at web server stage. Before today, i did use Ant tasks or Phing tasks in order to lock down the website using rewrite rules but effectively in Symfony2 project the console is really comfy and why don’t wrap maintenance page in a reusable bundle…

Here the source code: [https://github.com/wdalmut/CorleyMaintenanceBundle](https://github.com/wdalmut/CorleyMaintenanceBundle)

