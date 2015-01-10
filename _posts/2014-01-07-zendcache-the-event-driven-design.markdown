---
title: Zend\Cache – The event driven design
layout: post-page
excerpt: The event driven design of modern PHP frameworks is very useful and interesting. Different ZF2 components are designed with events as well. This feature, that adds different pre/post event abilities can solve different problems. One of those is to modify the caching layer configuration (ttl and others parameters) on different cacheable data.
permalink: /2014/01/07/zendcache-the-event-driven-design/
---

## Zend\Cache – The event driven design

<p class="small text-center">{{ page.date | date: "%-d %B %Y" }}</p>
<div>&nbsp;</div>

The event driven design of modern PHP frameworks is very useful and interesting. Different ZF2 components are designed with events as well. This feature, that adds different pre/post event abilities can solve different problems. One of those is to modify the caching layer configuration (ttl and others parameters) on different cacheable data.


All caching libraries provides at least two commands: set to and get from a cache (setItem and getItem for Zend\Cache). The ZF2 component add event on “pre set item” and “post set item” (and others but we will focus on pre set item event). Imagine that you want to use 14440 seconds of time to live as default timeout, but in case of no data (empty arrays in this example) we want to reduce the ttl to 120 seconds (just a get limiter, that means that we don’t want to route queries to a backend for 120 seconds).

In order to explain this, imagine that you need a object proxy cache layer. Typically is quite impossible to achieve a cache limiter with this implementation because you can’t call explicitly “setItem” and “getItem”. Those operation are used transparently by the proxy object. In order to obtain the object proxy with ZF2 component we can use something like this: (where $cacheStorage is a configured cache storage):

{% highlight php %}
<?php
$instance = Zend\Cache\PatternFactory::factory('object', [
    'object'  => $instance,
    'storage' => $cacheStorage,
    "cache_by_default" => false,
    "object_cache_methods" => ["read"]
]);
{% endhighlight %}

When you want to use the object (proxied by the cache layer) you will do:

{% highlight php %}
<?php
$instance->read("param1", "param2");
{% endhighlight %}

As you can see: you don’t use the “setItem” or “getItem” methods. This implies that you can’t control the time to live on empty results.

ZF2 Cache Layer add events in order to add functionalities and we can use those events in order to modify the cache storage options. First of all we have to see a typical configuration:

{% highlight php %}
'Cache\Distributed' => [
    'adapter' => [
        'name' => 'memcached',
        'options' => [
            'ttl' => 14400,
            'servers' => [
                ["a.cache.domain.tld", 11211]
            ],
            "namespace" => "mynamespace",
            'liboptions' => [
                'COMPRESSION' => false,
            ]
        ]
    ],
    'plugins' => [
        'exception_handler' => [
            'throw_exceptions' => false
        ],
        'Serializer',
    ]
],
{% endhighlight %}

The configuration has a “plugin” section, that is exactly what we need in order to add our “pre setItem” listener. We just have to inject a valid class name before/after the ‘Serializer’ plugin

{% highlight php %}
'plugins' => [
    'exception_handler' => [
        'throw_exceptions' => false
    ],
    'Your\\Namespace\\Listener\\Limiter',
    'Serializer',
]
{% endhighlight %}

Before move on, imagine that the “read” method of our instance object, responses always with array types: empty array if no data is available. In this case we have to limit the ttl to 120 seconds. See the ‘Limiter’ class that do this task:

{% highlight php %}
<?php
namespace Your\Namespace\Listener;

use Zend\Cache\Storage\Event;
use Zend\Cache\Storage\Plugin\AbstractPlugin;
use Zend\EventManager\EventManagerInterface;

class Limiter extends AbstractPlugin
{
    protected $handles = array();

    public function attach(EventManagerInterface $events)
    {
        $this->handles[] = $events->attach('setItem.pre', [$this, 'reduceTimeToLiveOnMissingContent']);

        return $this;
    }

    public function detach(EventManagerInterface $events)
    {
        foreach ($this->handles as $handle) {
            $events->detach($handle);
        }

        $this->handles = array();
        return $this;
    }

    public function reduceTimeToLiveOnMissingContent(Event $event)
    {
        $params = $event->getParams();

        $options = $event->getStorage()->getOptions();

        $elements = \unserialize($params["value"]);

        if (is_array($elements) && count($elements) == 2) {
            if (!count($elements[0])) {
                $options->setTtl(120);
            }
        }
    }
}
{% endhighlight %}

The interesting methods are “attach” and “reduceTimeToLiveOnMissingContent” that as method names says the first one attach this class as listener and on “setItem.pre” event the second method will be called.

You can notice that: we are check the first element of an array of two. Why? Our method reply with an array with data and not an array that wraps results! This occurs because, by default, the proxy also cache a possible output as well (stdout outputs). For that reason, if you don’t suppress the output cache in your configuration options, you have always to check the first element instead use your results directly.

