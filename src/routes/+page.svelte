<script lang="ts">
	import Circle from '$lib/Circle.svelte';
	import '$lib/main.scss';
	import { onMount } from 'svelte';

	let firstClassItems: string[] = [
		'quaternions',
		'vectors',
		'matricies',
		'tables',
		'units',
		'roman numerals',
		'graphs',
		'dates',
		'octonions',
		'calculus',
		'p-adic numbers',
		'molecules',
		'seximal literals'
	];

	firstClassItems = firstClassItems.concat(firstClassItems).concat(firstClassItems);

	const spans: HTMLSpanElement[] = [];

	let t = 0;

	const update = (time: number) => {
		requestAnimationFrame(update);
		t = time / 1000;
		// spans.forEach((it, i) => {
		// 	if (it !== undefined && it !== null) {
		// 		it.style.top = `${i * 80 - t * 100}px`;
		// 	}
		// });
	};

	onMount(() => {
		t = 0;
		update(0);
		animateFirstClass();
	});

	const animateFirstClass = () => {
		spans.forEach((it, i) => {
			const animation = it.animate(
				[
					{
						transform: `translateY(${-(i - spans.length / 3) * 100}px)`
					},
					{
						transform: `translateY(${-(i - spans.length / 3) * 100 + 100 * (spans.length / 3)}px)`
					}
				],
				{
					duration: 1000 * (spans.length / 3),
					fill: 'both'
				}
			);
			if (i === 0) animation.onfinish = animateFirstClass;
		});
	};
</script>

<div class="logo-wrapper">
	<Circle />
	<!-- <img
		class="logo"
		src="/cool-circle.svg"
		alt="Four concentric orange circles, two of which have only partial arcs."
	/> -->
</div>

<div class="content dark">
	<div class="text">
		<h1>Why cool?</h1>
		<p>
			Programmatic innovation has come to a halt. Coolscript is built off of one fundamental,
			guiding principle: Programs don't need to be fast, readable, or sustainable. They need to be
			cool. Coolscript takes risks that AAA languages wouldn't dare take and changes the programming
			language game.
		</p>
	</div>
</div>

<div class="content dark">
	<div class="text">
		<h1>Introduction to Critical Cool Analysis</h1>
		<p>
			The Coolscript devs have taken a heuristic approach to analysing the Coolness of a language
			and developed multiple Critical Cool Code Criteria; these criteria combine to create a
			Critical Cool Code Count that determines the average Coolness of a language. Variously
			languages have been
		</p>
	</div>
</div>

<div class="content dark">
	<div class="text fc">
		First class <span class="fc-subject">
			{#each firstClassItems as t, i}
				<span class="subject" bind:this={spans[i]}>{t}</span>
			{/each}
		</span>
	</div>

	<div class="fade-overlay" />
</div>

<div class="content dark">
	<div class="text">
		<h1>
			Build your own language with <div class="gradient">def blocks.</div>
		</h1>
		<p>
			This is the next stage of programming: breaking the boundaries of the first class. def blocks
			allow you to use Regex (and our newly designed superset, Plane Regex) to create arbitrary
			expressions. Take your DSL to the next level or make a entirely new language feature with just
			a few lines.
		</p>
	</div>
</div>
