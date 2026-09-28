---
layout: layouts/page.njk
permalink: /about/
title: "Hi, I'm Aaron."
eyebrow: About
description: Senior designer at the University of Notre Dame, illustrator, woodworker, gardener, sci-fi reader, and dad of two boys.
bodyClass: is-about
---

<div class="about">

<div class="about__intro">
	<figure class="about__photo">
		{%- if site.author.photo %}
		<img src="{{ site.author.photo }}" alt="Portrait of {{ site.author.name }}" width="480" height="480">
		{%- else %}
		<span class="about__initials" aria-hidden="true">{{ site.author.name | initials }}</span>
		{%- endif %}
	</figure>
	<div class="about__lede prose">
		<p>I'm <strong>{{ site.author.name }}</strong>, a senior designer at the University of Notre Dame. Most of my week goes into designing and building websites for campus: accessible components, flexible layouts, and the small details that make a page feel considered.</p>
		<p>This journal is where those solutions go, so they don't get lost in a closed ticket or an old branch. If one of them saves you an afternoon, it's done its job.</p>
		<ul class="about__links" role="list">
			<li><a href="{{ site.author.links.linkedin }}">LinkedIn</a></li>
			<li><a href="{{ site.author.links.instagram }}">Sketchbook on Instagram</a></li>
			<li><a href="mailto:{{ site.author.email }}">Email</a></li>
		</ul>
	</div>
</div>

<div class="prose about__body">

## Notre Dame, long before it was my job

I was born and raised in northern Indiana, just down the road from campus, so Notre Dame has always carried a certain weight and excitement for me. I grew up going to home games with my dad, and when we weren't in the stadium we were watching Saturday night games at home. In high school I spent a lot of those game days volunteering at the concession stands.

Getting to design for the University now still feels a little surreal. I know what the place means to people, because it has meant a lot to me for most of my life.

## How I got here

I studied art first. I earned a BFA in graphic design and have always loved making things by hand. After school I worked at a few web agencies around the area, designing and building sites for all kinds of clients. That mix of agency speed and design training shaped how I work today: start with the craft, then make it hold up in the real world, on every screen and for every reader.

## What you'll find here

<ul class="about__features" role="list">
	<li><strong>Real code from real projects.</strong> Every article comes out of work on Notre Dame sites.</li>
	<li><strong>Live demos you can resize.</strong> Drag the handle, or press Expand to try phone and tablet widths.</li>
	<li><strong>Search and filters.</strong> Search covers the full text of every article and code sample.</li>
	<li><strong>Copy and go.</strong> Every code block has a Copy button, and the code is MIT licensed.</li>
</ul>

## Tools I reach for

<div class="about__tools">
	<section>
		<h3>At the desk</h3>
		<ul role="list">
			<li><strong>VS Code</strong> for writing code</li>
			<li><strong>Figma</strong> for designing layouts and components</li>
			<li><strong>Adobe Illustrator</strong> for icons, illustrations and anything vector</li>
			<li><strong>ImageOptim</strong> so every image ships as small as it can</li>
		</ul>
	</section>
	<section>
		<h3>At the drawing table</h3>
		<ul role="list">
			<li><strong>Bristol board</strong>, my favorite paper to draw on</li>
			<li><strong>Faber-Castell PITT artist pen</strong>, size 0.5</li>
		</ul>
	</section>
</div>

## Away from the screen

I'm a man with far too many hobbies. I draw, and you can follow along on [my sketchbook Instagram]({{ site.author.links.instagram }}). I build furniture and other projects in the woodshop, I keep a garden, and most importantly I'm a dad to two boys, who keep me busier than all of the above combined.

When I do get a quiet moment, I'm usually reading. I'm hooked on near-future science fiction, the kind that feels like it could happen next year and asks what we'd do if it did.

<div class="about__tools">
	<section>
		<h3>A few favorite reads</h3>
		<ul role="list">
			<li><strong><cite>Recursion</cite></strong> by Blake Crouch</li>
			<li><strong><cite>Project Hail Mary</cite></strong> by Andy Weir</li>
			<li><strong><cite>Daemon</cite></strong> by Daniel Suarez</li>
		</ul>
	</section>
</div>

## <span class="highlight">Get in touch</span>

Found a bug in an example, or have a better way to do something? I'd love to hear it. Email me at [{{ site.author.email }}](mailto:{{ site.author.email }}), or leave a comment on any article.

<p class="about__coffee">If something here helped you out, you can <a href="{{ site.author.links.coffee }}">buy me a coffee</a>. It's never expected, always appreciated.</p>

</div>

</div>
