---
title: Raspberry Pi – Ultrasonic Library
layout: post-page
excerpt: A couple of days ago I found an interesting breakout. The HC-SR04 ultrasonic sensor. It is so cheap, just 3€ (yes, three euros). Why not, why don’t buy it… There is a little problem with this component, it is TTL 0 – 5V. All Raspberry Pi GPIO, are 3,3V and not 5V tollerant. So I decided to skip this problem (yes i skip the problem… but, with a couple of resistor I think you can achieve a good solution), just because I don’t have any resistor at home… Now the point is -> Do i damaged my Raspberry Pi?
permalink: /2014/01/11/raspberry-pi-ultrasonic-library/
---
A couple of days ago I found an interesting breakout. The HC-SR04 ultrasonic sensor. It is so cheap, just 3€ (yes, three euros). Why not, why don’t buy it… There is a little problem with this component, it is TTL 0 – 5V. All Raspberry Pi GPIO, are 3,3V and not 5V tollerant. So I decided to skip this problem (yes i skip the problem… but, with a couple of resistor I think you can achieve a good solution), just because I don’t have any resistor at home… Now the point is: Do i damaged my Raspberry Pi?


For anybody that wants to know the answer… No, my Raspberry is alive and works correctly. Pay attention because the problem is real and we should have to treat all signals.

<div class="row text-center">
<img alt="ultrasonic library" src="/static/img/posts/CAM00159-300x225.jpg" />
</div>

The HC-SR04 is simple, 4 pins. Power and Ground as usual and… Trigger and Echo Back pins. We have to use those for work with this board. The breakout just measure the timing between it and an obstacle with ultrasonic waves (velocity of sound and so on…) and you have to do the same with using HIGH and LOW signal levels on the echo back pin… It’s explained well in the [HCSR04b](http://walterdalmut.com/wp-content/uploads/2014/01/HCSR04b.pdf) datasheet.

I have written a C library, here the [source code](https://github.com/wdalmut/libultrasonic) (tag 0.0.1) that abstract this breakout in order to use it with just a couple of commands.

{% highlight c %}
void ultrasonic_init()
double ultrasonic_ranging();
{% endhighlight %}

The init function just prepare the Raspberry Pi pins and the ranging function reply with meters between the breakout and an obstacle.

You have to compile the project using the Makefile (by default the project uses MOSI (SPI GPIO) for the trigger pin and the MISO (SPI GPIO) for the echo back pin.

{% highlight sh %}
$ git clone https://github.com/wdalmut/libultrasonic.git
$ cd libultrasonic
$
$ make -C src/ board=hc_sr04
{% endhighlight %}

Now you have the static library compiled, compile also the base example and try the breakout.

{% highlight sh %}
$ make -C examples/
pi@raspberrypi ~/git/libultrasonic $ sudo ./build/ranging
1.706897
pi@raspberrypi ~/git/libultrasonic $ sudo ./build/ranging
1.689655
pi@raspberrypi ~/git/libultrasonic $ sudo ./build/ranging
1.810345
pi@raspberrypi ~/git/libultrasonic $ sudo ./build/ranging
1.706897
{% endhighlight %}

Remember that the ultrasonic library replies with meters.

### Updated Article

Update on 20th April 2014 – thanks to Rob that underline that the compilation procedure needs the board selection. I have updated the article

{% highlight sh %}
$ make -C src/ board=hc_sr04
{% endhighlight %}


