---
title: Clean Code – UpCloo Web Framework
layout: post-page
excerpt: I have written about the UpCloo Web Framework  few months ago <a href="/2013/07/21/micro-framework-on-top-of-zf2-components/">(click here)</a> and, as the README.md says, the micro-framework (App.php) is quite a bit messy. At this time is important, before starting add new features, clean the code base a little bit and move on with the microframework. In order to do this I want to apply the Boy Scout Rule "Always leave the campground cleaner than you found it". First of all I ran all tests and I discover that App.php is poorly covered (only 46%) and many key features not at all (at commit c70375e6).
permalink: /2014/01/24/clean-code-upcloo-web-framework/
---

## Clean Code – UpCloo Web Framework

<p class="small text-center">{{ page.date | date: "%-d %B %Y" }}</p>
<div>&nbsp;</div>

I have written about the UpCloo Web Framework  few months ago [(click here)](/2013/07/21/micro-framework-on-top-of-zf2-components/) and, as the README.md says, the micro-framework (App.php) is quite a bit messy. At this time is important, before starting add new features, clean the code base a little bit and move on with the microframework. In order to do this I want to apply the Boy Scout Rule: “Always leave the campground cleaner than you found it”. First of all I ran all tests and I discover that App.php is poorly covered (only 46%) and many key features not at all (at commit c70375e6).


Its time to cover much more than this in order to change the code base. I see that the “bootstrap” operation is completely uncovered and the same is valid for listener registration and other important things. Its time to cover the application dispatching.

In commit [a3fb91b](https://github.com/wdalmut/upcloo-web-framework/commit/a3fb91b42a20b3335758eb1c24a4a27916dbaa30) I have added tests in order to cover all aspects of the framework. After that I have removed functional testing through Selenium that are useless at this time.

One of the first things that I don’t like is: all statements that checks ifs a particular configuration section exists or not.

{% highlight php %}
<?php
private function registerRouter() {
    if (!array_key_exists("router", $this->conf)) {
        $this->conf["router"] = array();
    }
    ...
}
{% endhighlight %}

For that reason I decided to start the framework with base configuration and users can override this one through the constructor. In commit [e4ad8459](https://github.com/wdalmut/upcloo-web-framework/commit/e4ad845909b778d6880954995d865feb3694b12c) I made this change, where in practice I get a general app configuration at the beginning:

{% highlight php %}
<?php
class App
    ...

    public function __construct(array $configs)
    {
        $conf = $this->getAnEmptyConf();
        foreach ($configs as $confFile) {
            $conf = array_replace_recursive($conf, $confFile);
        }
        $this->conf = $conf;
    }

    private function getAnEmptyConf()
    {
        return [
            "router" => [],
            "services" => [
                "invokables" => [
                    "UpCloo\\Renderer\\Jsonp" => "UpCloo\\Renderer\\Jsonp"
                ],
                "aliases" => [
                    "renderer" => "UpCloo\\Renderer\\Jsonp",
                ]
            ],
            "listeners" => []
        ];
    }
    ...
}
{% endhighlight %}

I continued on this way until I found that the code base is quite clear, i think, at the commit: [acd5e6c50de](https://github.com/wdalmut/upcloo-web-framework/commit/acd5e6c50de2d68fdac90955ac5305836582798a) and I have tagged this release as 0.0.8.

Now, In my opinion the App.php has at least 3 responsibilities: configuration, bootstrap (setup) and run (dispatch) requests. I want to separate responsibilities in three different sections.

I separated key features in separate objects: ArrayProcessor to merge configuration together, Boot to setup the application and the last one the Engine class in order to run the application. I work on this in a separate branch (from [6d695f684](https://github.com/wdalmut/upcloo-web-framework/commit/6d695f684806b21d0f01f82286763223f59b80d4) to [87ad7e73](https://github.com/wdalmut/upcloo-web-framework/commit/87ad7e733d215a4ea0f6f78bbe7e3c7fce089e69)). In this process I introduced a single BC, the app configuration process. At the beginning is something like:

{% highlight php %}
<?php
$app = new \UpCloo\App([
    include __DIR__ . '/config/conf1.php',
    include __DIR__ . '/config/conf1.prod.php',
]);

$app->run();
{% endhighlight %}

I changed this into this:

{% highlight php %}
<?php
$config = new UpCloo\App\Config\ArrayProcessor();
$config->appendConfig(include __DIR__ . '/configs/conf1.php');
$config->appendConfig(include __DIR__ . '/configs/conf1.prod.php');

$boot = new UpCloo\App\Boot($configs);

$engine = new \UpCloo\App\Engine();

$app = new UpCloo\App($engine, $boot);
$app->run();
{% endhighlight %}

It is much verbose, but in this way I left open the possibility to change the engine (event driven) with a new implementation, the bootstrap section with a different boot and also a different configuration processor.

