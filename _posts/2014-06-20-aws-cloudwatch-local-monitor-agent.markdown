---
title: AWS CloudWatch local monitor agent
layout: post-page
excerpt: When you manage an online application one the most important thing is resources monitoring in order to collect and understand internal metrics of your application and trigger alarms in case of problems (close feedback loop -> machine to machine networks). AWS CloudWatch is an interesting starting point but effectively send all your events directly to the cloud monitor can impact on your application.
permalink: /2014/06/20/aws-cloudwatch-local-monitor-agent/
---

## AWS CloudWatch local monitor agent

<p class="small text-center">{{ page.date | date: "%-d %B %Y" }}</p>
<div>&nbsp;</div>

When you manage an online application one the most important thing is resources monitoring in order to collect and understand internal metrics of your application and trigger alarms in case of problems (close feedback loop -> machine to machine networks). AWS CloudWatch is an interesting starting point but effectively send all your events directly to the cloud monitor can impact on your application.


For that reason i have started a new project that runs locally and listen for incoming messages, collect them and sent periodically to AWS CloudWatch.

The agent is listening for incoming UDP/IP packets on localhost, it collects and shrinks all data received in order to publish only results to AWS CloudWatch.

All messages are JSON objects that indicates the “namespace”, “metric name” and the metric “value” in this form (from 0.0.6 you can also put the unit and the operation type):

{% highlight json %}
{
    "namespace": "my-web-app",
    "metric": "database-query-time",
    "value": "12.42"
}
{% endhighlight %}

The UDP/IP simplify all the communication problems and the datagram protocol create a sort of sandbox for the application that can send packets also in case of agent problems and failures (no guarantees on packages loss). The agent is designed to run locally (and only locally), in that way we can, reasonably, skip the UDP/IP packet  loss  problems.

The long running process is written in Go. In that way i can control all the concurrency needs of the agent and separate processes and obtain a very high performances (300k # per minute on a m1.small instance).

You can find the [daemon here](https://github.com/wdalmut/cloudwatch-agent) (local lagent)

For PHP application i have written a simple client library

{% highlight php %}
<?php
namespace Corley\CloudWatch;

class Agent
{
    public static function point($namespace, $metric, $value)
    {
        $message = json_encode(array('namespace' => $namespace, 'metric' => $metric, 'value' => floatval($value)));
        $sock = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
        socket_sendto($sock, $message, strlen($message), 0, '127.0.0.1', 1234);
        socket_close($sock);
    }
}
{% endhighlight %}

Here you can find the [PHP client library](https://github.com/wdalmut/php-cloudwatch-agent-client) project

