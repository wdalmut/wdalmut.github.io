---
title: Raspberry Pi – C GPS NMEA library (Global Positioning System)
layout: post-page
excerpt: A couple of weeks ago I bought a Raspberry Pi and it is an interesting board&#58; ARM processor, 512MB RAM (v2) and many other things like GPIOs. I want to realize something that works with GPS and IMUs. This board, with raspbian and other linux based os, is not an embedded system, is more like a general purpose computer but with more interesting possibilities. First of all&#58; Go programming language is designed also for this kind of platforms (ARM based) and this open a wide set of incredible projects and with GPIOs we can communicate easily with different peripherals.
permalink: /2013/11/23/raspberry-pi-c-gps-nmea-library-global-positioning-system/
---
A couple of weeks ago I bought a Raspberry Pi and it is an interesting board: ARM processor, 512MB RAM (v2) and many other things like GPIOs. I want to realize something that works with GPS and IMUs. This board, with raspbian and other linux based os, is not an embedded system, is more like a general purpose computer but with more interesting possibilities. First of all: Go programming language is designed also for this kind of platforms (ARM based) and this open a wide set of incredible projects and with GPIOs we can communicate easily with different peripherals.

Golang is not only designed also for ARMs but it has a very wonderful integration with C programs and libraries. For that reason I have decided to decouple the problem of realize something that can use GPS and IMUs boards in 2 main parts. The “lower part” developed in C that communicate and abstract the data layer and the second part (the general program) in Golang.

I bought a GPS board (in particular the: Adafruit Ultimate GPS Breakout – 66 channel w/10 Hz updates – Version 3) that supports the NMEA standard and can provides updates at a good rates (10Hz).

Before start buying things I have written the C library that I will use as the base layer for GPS (you can find the project here: [https://github.com/wdalmut/libgps](https://github.com/wdalmut/libgps)). The goal of this project is to simplify all the operation around the GPS board, for example see a GPS data logger implementation (in C).

<div class="row text-center">
<img alt="raspberry navigation shield" src="/static/img/posts/CAM00076-300x224.jpg"/>
</div>

### GPS Data logger in 3 lines of code

Before starting, remember that you have to use the serial port of Raspberry Pi not through the console but with a peripheral and for that reason you have to configure your pi board (follow the manual: [Connect Raspberry Pi to a microcontroller or other peripheral](http://elinux.org/RPi_Serial_Connection#Connection_to_a_microcontroller_or_other_peripheral))

You just need the main entry point:

{% highlight c %}
#include <stdio.h>
#include <stdlib.h>
#include <gps.h>

int main(void) {
    // Open the communication
    gps_init();

    loc_t data;

    while (1) {
        gps_location(&data);

        // You can extends adding data.speed, data.altitude, data.course (the direction)
        printf("%lf %lf\n", data.latitude, data.longitude);
    }

    return EXIT_SUCCESS;
}
{% endhighlight %}

That’s all! You have just to compile your program directly on the Raspberry Pi!

{% highlight sh %}
gcc -o position_logger position_logger.c -lgps -lm
{% endhighlight %}

Now you have your compiled program (position_logger), run it!

{% highlight sh %}
./position_logger
{% endhighlight %}

You will see in the console something like this:

{% highlight sh %}
45.071060 7.646363
45.071082 7.646385
45.071078 7.646387
45.071060 7.646373
45.071048 7.646358
45.071052 7.646372
45.071057 7.646392
45.071062 7.646397
45.071062 7.646383
45.071073 7.646395
45.071082 7.646403
{% endhighlight %}

That’s all!! In just 3 lines of codes we have a GPS data logger!

