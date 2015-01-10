---
title: Vim – Related Test Plugin
layout: post-page
excerpt: I use Vim as text editor during my daily work on source code. It is cool, i like it almost always. My projects are typically test driven or at least i always create a bunch of tests. Movements between buffers are quite simple in Vim but i want something that can simplify my life more. Issue a command in order to open a related test-case from a source file or viceversa.
permalink: /2014/02/01/vim-related-test-plugin/
---
I use Vim as text editor during my daily work on source code. It is cool, i like it almost always. My projects are typically test driven or at least i always create a bunch of tests. Movements between buffers are quite simple in Vim but i want something that can simplify my life more. Issue a command in order to open a related test-case from a source file or viceversa.

Vim is really extensible with plugin. So i decided to create my own plugin to solve my movement problem. The idea is really simple: issue a command to open a related file (source from test and viceversa). Now the first problem is that I work in different programming languages, PHP Golang, Java, C at least. Every language has its own way to place tests and source files. In Golang test files are immediately near a related source file, in PHP typically we use a couple of different folders: “src” and “tests”.

For that reason the plugin support different strategies to open a related file, one for each programming language. Viml is particular and strange language but write down a quite rude plugin is so simple!

You can find my plugin source on Github here: [https://github.com/wdalmut/vim-relatedtest](https://github.com/wdalmut/vim-relatedtest)

You can use Vundle to install this plugin.

