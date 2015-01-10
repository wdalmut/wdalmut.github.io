---
title: BDD – WordPress Behat Extension
layout: post-page
excerpt: A month ago I discuss with a customer about BDD, Behavior-Driven Development, and i show our exciting results with this approach. He  was extremely interested in because he knows how many time a company waste during a product development because of missing business expectations. They uses WordPress  as a framework and develop several plugins in order to realize custom features.
permalink: /2014/04/06/bdd-wordpress-behat-extension/
---
A month ago I discuss with a customer about BDD, Behavior-Driven Development, and i show our exciting results with this approach. He  was extremely interested in because he knows how many time a company waste during a product development because of missing business expectations. They uses WordPress  as a framework and develop several plugins in order to realize custom features.

Nowadays exists different extensions for Behat like: Symfony2, ZF2 etc.. But nothing that can simplify the usage of stories for WordPress based applications. This is why i have written a Behat Extension for WordPress.

You can find the source code here: [https://github.com/wdalmut/WordPressExtension](https://github.com/wdalmut/WordPressExtension)

The extension configuration get your WordPress installation path and offers a context with a list of already implemented definitions like: install wordpress, logins, add users, add posts, pages and so on…

Pay attention that the extensions uses the Mink configuration in order to understand where is available your WordPress application and it also uses the path in order to load your database configuration and other resources. In that way you can uses all WordPress functions during your feature definition, i.e. wp_insert_post and others. In that way you can write your stories without doing anything with your WordPress because the extension treats all things for you automatically.

You can find examples of features directly in the source repository. Here a simple story:

{% highlight cucumber %}
Feature: You can read blog posts
    In order to read blogs
    As a user
    I need to go to the blog

    Background:
        Given I have a vanilla wordpress installation
            | name          | email                   | username | password |
            | BDD WordPress | walter.dalmut@gmail.com | admin    | test     |
        And there are posts
            | post_title      | post_content    | post_status | post_author |
            | Just my article | The content     | publish     | 1           |
            | My draft        | This is a draft | draft       | 1           |

    Scenario: List my blog posts
        Given I am on the homepage
        Then I should see "Just my article"
        And I should see "Hello World"
        And I should not see "My draft"
{% endhighlight %}

