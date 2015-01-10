---
title: Zend Framework (ZFDay) 2014 – Turin
layout: post-page
excerpt: I was one of ZFDay’s speakers, here in Turin on 7th February. I present a talk with title "Build your own (micro)framework with ZF2 components (as building blocks)". In practice i present how we can achieve an interesting result with just a couple of components. The framework that we have created at the conference is based on the event manager and relies on the service manager for getting and resolve internal/external services. In this little article i just want to explain more the framework.
permalink: /2014/02/08/zend-framework-zfday-2014-turin/
---
I was one of ZFDay’s speakers, here in Turin on 7th February. I present a talk with title: Build your own (micro)framework with ZF2 components (as building blocks). In practice i present how we can achieve an interesting result with just a couple of components. The framework that we have created at the conference is based on the event manager and relies on the service manager for getting and resolve internal/external services. In this little article i just want to explain more the framework.

Here you can find my slides:

<div class="row text-center">
<iframe src="//www.slideshare.net/slideshow/embed_code/30952654" width="640" height="520" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/corleycloud/build-a-custom-microframework-with-zf2-components-as-building-blocks" title="Build a custom (micro)framework with ZF2 Components (as building blocks)" target="_blank">Build a custom (micro)framework with ZF2 Components (as building blocks)</a> </strong> from <strong><a href="//www.slideshare.net/corleycloud" target="_blank">Corley S.r.l.</a></strong> </div>
</div>

Many people are interested in this presentation and ask to me to explain better the micro-framework in its internals.

The core components are:

 * Event Manager
 * Http Requests
 * Http Responses
 * Service Manager

Event manager is very simple component, based on the Observer Pattern (or Pub/Sub if you prefer). In practice you can “trigger” events and all “listeners” “attached” to those events are called back automatically. See a little piece of code:

{% highlight php %}
<?php
$eventManager->trigger("pre.fetch");
{% endhighlight %}

We are saying that all listeners attached on “pre.fetch” should be called now. The ZF2 event manager works also with a “target” and a “parameter list”. It means that the “event” brings with it a target (from its point of view) and a parameter list. Suppose that we are in an object scope (the App class) and we trigger an event in this way:

{% highlight php %}
<?php
$eventManager->trigger("pre.fetch", $this, ["key" => "value"]) ;
{% endhighlight %}

The event object, passed to all listeners, is composed by the target (the App class resolved by $this) and params (the array structure). From the listener point of view:

{% highlight php %}
<?php
public function theListenerCallback(Event $event)
{
    $target = $event->getTarget(); //The App class
    $params = $event->getParams() // The array
    ...
}
{% endhighlight %}

This this quite all about the event manager for us and for our micro-framework structure design. Events are very interesting in my opinion because they can help us to decouple our responsibilities in separate structure and we can add and remove features in a simple way. For example, if i have a subscriber action, instead add logic to that action for doing a secondary things, i can trigger an event and attach dedicated listeners to it:

{% highlight php %}
<?php
public function addNewSubscriber()
{
    $entityManager = $this->get("entityManager");
    $user = new User();
    //...
    $entityManager->persist($user);
    $entityManager->flush();

    $this->eventManager->trigger("subscriber.new", $user);
}
{% endhighlight %}

As you can see I can create different listeners and resolve any other tasks related to the “new subscriber” event externally (send emails, update statistics and so on). That thing brings several benefits, for example when i add or remove listeners, the addNewSubscriber coverage is not changing (for testing purposes).

### The Framework

The idea is very simple, is just this:

{% highlight php %}
<?php
class App
{
    public function run()
    {
        $this->trigger("begin");
        $this->trigger("route");
        $this->trigger("pre.fetch");
        $this->trigger("execute");
        $this->trigger("render");
        $this->trigger("finish");
    }

    // just setters and getters
}
{% endhighlight %}

Effectively, a request is something that i want to resolve in steps: route it to a controller, dispatch it, serialized the response and send it to the client. It means that I need: “route listener”, “action listener”, “renderer listener” and an “emitter listener” that send the response.

But we have a problem… In case of errors (404, 500, etc)? We have to found a way to address this problem. Every time you “trigger” something you get back a list with all listeners replies. We can make an assumption, the last “route” event listener, should reply with a “route match”, it means that it has found an action listener.

{% highlight php %}
<?php
class App
{
    public function run()
    {
        $this->trigger("begin");
        $routeMatch = $this->trigger("route")->last();
        if ($routeMatch) {
            $this->trigger("pre.fetch");
            $this->trigger("execute");
        } else {
            // which kind of error? 404 and other possibilities?
        }
        $this->trigger("render");
        $this->trigger("finish");
    }

    // just setters and getters
}
{% endhighlight %}

If we do something like the previous example, we are unable to handle different error possibilities. Ok refactor this part in a more useful way

{% highlight php %}
<?php
try {
    $routeMatch = $this->trigger("route")->last();
    if (null === routeMatch)  {
        throw new PageNotFoundException();
    }
    $this->trigger("pre.fetch");
    $this->trigger("execute");
} catch (PageNotFoundException $e) {
    // 404
    $this->trigger("404");
} catch (HaltException $e) {
    // Other kinds of problems...
    $this->trigger("halt");
} catch (Exception $e) {
    // Application error
    $this->trigger("500");
}
{% endhighlight %}

I think that we have solved our problem moving the conditional part to a chain of responsibilities. In this way the flow of our framework can change in case of unusual conditions. I want to draw your attention that we have always a begin, render and finish events because we still need to serialize and send the response to the client (with error information of course). In case of “Page not found” error the event flow is this one:

 1. begin
 2. route
 3. 404
 4. render
 5. finish

That is different from the normal flow

 1. begin
 2. route
 3. pre.fetch
 4. execute
 5. render
 6. finish

The framework is essentially that, not much more of that. Of course, we still have to design different components:

 * A Route Listener
 * A Renderer Listener
 * An Emitter that send the response to the client
 * But those are very easy and quite common, the route listener extract a route match from a request, the renderer prepare the response and emitter sends it to the client…

Here is the core structure:

<script src="https://gist.github.com/wdalmut/19d482583985f38828af.js?file=App.php"></script>

