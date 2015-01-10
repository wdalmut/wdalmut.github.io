---
title: Raspberry Pi – IMU library (Inertial Measurement Unit)
layout: post-page
excerpt: GPIOs are super interesting in Raspberry Pi. My version of this board (Model B) has a couple of i2c buses available for use. GNU/Linux handle i2c as character devices. Thanks to this, is super easy develop something that communicate with i2c peripherals. My friend Gabriele Mittica bought an IMU breakout for Arduino and for the Grove shield, the MMA7660FC board. He gave that to me in order to try it with the Raspberry Pi board.
permalink: /2013/11/30/raspberry-pi-imu-library-inertial-measurement-unit/
---
GPIOs are super interesting in Raspberry Pi. My version of this board (Model B) has a couple of i2c buses available for use. GNU/Linux handle i2c as character devices. Thanks to this, is super easy develop something that communicate with i2c peripherals. My friend [Gabriele Mittica](http://www.gabrielemittica.com/) bought an IMU breakout for Arduino and for the Grove shield, the MMA7660FC board. He gave that to me in order to try it with the Raspberry Pi board.

s bus is tipicaly easy, synchronous, low speed (by default 100khz [on RPI] and goes up to 400khz) few connections (is a serial bus) just the clock (synchronous) and the data (half-duplex). This particular accelerometer, MMA7660FC,  is interesting but with a little range of measurements, just 1.5g on 3 axises. It can be useful for detect orientation, tilt and other minor things.

<div class="row text-center">
<img src="/static/img/posts/CAM00082-300x225.jpg" alt="imu board" />
</div>

I have start a project on Github ([source here](https://github.com/wdalmut/libimu)) that wrap as a library the board and it is very simple to use. It is based on just 4 functions:

 * accel_init – that initialize the communication with the device, open the character device and check that’s all ok
 * accel_on – Turn on the board and prepare it in order to get data
 * accel_get – Get data from the board
 * accel_off – Turn off the board

The point is that: those functions wants to abstract the workflow with a generic IMU device (only accelerations of course but I will extends for gyro and magnetometers) but how I can achieve that? There is a lot of ways, pre-compiler defines and many others possible methods. I choose to work at compile time in order to “link” my designed methods with my interface methods. In this ways i can use a general approach (with accel_get) or use a “native” way “mma7660_custom_method” if needed.

In order to compile the library you have to select the board:

{% highlight sh %}
$ make board=mma7660fc
{% endhighlight %}

Of course at this time i work only on this board but i will add a different breakout, the MPU9150. My friend [Francesco Ficili](http://www.francescoficili.com/) will design a develop board that includes the MPU9150 board and the GPS board that i have previous used.

