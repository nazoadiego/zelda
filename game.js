kaboom({
	global: true,
	fullscreen: true,
	scale: 1,
	debug: true,
	clearColor: [0, 0, 1, 1],
});

loadRoot("https://i.imgur.com/");
// Link
loadSprite("link-going-left", "1Xq9biB.png");
loadSprite("link-going-right", "yZIb8O2.png");
loadSprite("link-going-down", "tVtlP6y.png");
loadSprite("link-going-up", "UkV0we0.png");

// Wall
loadSprite("left-wall", "rfDoaa1.png");
loadSprite("top-wall", "QA257Bj.png");
loadSprite("bottom-wall", "vWJWmvb.png");
loadSprite("right-wall", "SmHhgUn.png");

// Wall corners
loadSprite("bottom-left-wall", "awnTfNC.png");
loadSprite("bottom-right-wall", "84oyTFy.png");
loadSprite("top-left-wall", "xlpUxIm.png");
loadSprite("top-right-wall", "z0OmBd1.jpg");

// Door
loadSprite("top-door", "U9nre4n.png");
loadSprite("left-door", "okdJNls.png");

// Misc
loadSprite("fire-pot", "I7xSp7w.png");
loadSprite("lanterns", "wiSiY09.png");
loadSprite("stairs", "VghkL08.png");
loadSprite("bg", "u4DVsx6.png");
loadSprite("kaboom", "o9WizfI.png");

// Enemies
loadSprite("slicer", "c6JFi5Z.png");
loadSprite("skeletor", "Ei1VnX8.png");

scene("game", ({ level, score }) => {
	layers(["bg", "obj", "ui"], "obj");

	const levelOne = [
		"wcc)cctccx",
		"a        b",
		"a      * b",
		"a    f   b",
		"l        b",
		"a   f    b",
		"a  *     b",
		"a        b",
		"ydd)dd)ddz",
	];
	const levelTwo = [
		"wccccccccx",
		"a        b",
		")        )",
		"a        b",
		"a  }     b",
		"a       $b",
		")        )",
		"a        b",
		"yddddddddz",
	];

	const maps = [levelOne, levelTwo];

	const levelCfg = {
		width: 48,
		height: 48,

		// wall
		a: [sprite("left-wall"), solid(), "wall"],
		b: [sprite("right-wall"), solid(), "wall"],
		c: [sprite("top-wall"), solid(), "wall"],
		d: [sprite("bottom-wall"), solid(), "wall"],

		// wall corner
		w: [sprite("top-left-wall"), solid(), "wall"],
		x: [sprite("top-right-wall"), solid(), "wall"],
		y: [sprite("bottom-left-wall"), solid(), "wall"],
		z: [sprite("bottom-right-wall"), solid(), "wall"],

		// doors
		l: [sprite("left-door"), solid()],
		t: [sprite("top-door"), "next-level"],
		$: [sprite("stairs"), "next-level"],

		// enemies
		"*": [sprite("slicer"), "slicer", "dangerous", { dir: -1 }],
		"}": [sprite("skeletor"), "skeletor", "dangerous", { dir: -1, timer: 0 }],

		// misc
		")": [sprite("lanterns"), solid(), "wall"],
		f: [sprite("fire-pot"), solid()],
	};
	addLevel(maps[level], levelCfg);

	add([sprite("bg"), layer("bg")]);

	add([text("Press Space to Attack"), pos(60, 450), layer("ui"), scale(2)]);

	const scoreLabel = add([
		text(`score: ${score}`),
		pos(320, 480),
		layer("ui"),
		{
			value: score,
		},
		scale(2),
	]);

	add([text("level " + parseInt(level + 1)), pos(320, 500), scale(2)]);

	const player = add([
		sprite("link-going-right"),
		pos(10, 190),
		{
			// right by default
			dir: vec2(1, 0),
		},
	]);

	player.action(() => {
		player.resolve();
	});

	player.overlaps("next-level", () => {
		go("game", {
			level: (level + 1) % maps.length,
			score: scoreLabel.value,
		});
	});

	player.collides("door", (d) => {
		destroy(d);
	});

	const MOVE_SPEED = 360;

	keyDown("left", () => {
		player.changeSprite("link-going-left");
		player.move(-MOVE_SPEED, 0);
		player.dir = vec2(-1, 0);
	});

	keyDown("right", () => {
		player.changeSprite("link-going-right");
		player.move(MOVE_SPEED, 0);
		player.dir = vec2(1, 0);
	});

	keyDown("up", () => {
		player.changeSprite("link-going-up");
		player.move(0, -MOVE_SPEED);
		player.dir = vec2(0, -1);
	});
	keyDown("down", () => {
		player.changeSprite("link-going-down");
		player.move(0, MOVE_SPEED);
		player.dir = vec2(0, 1);
	});

	function spawnKaboom(p) {
		const obj = add([sprite("kaboom"), pos(p), "kaboom"]);
		wait(0.2, () => {
			destroy(obj);
		});
	}

	collides("kaboom", "dangerous", (k, d) => {
		camShake(10);
		wait(0.2, () => {
			destroy(k);
		});
		destroy(d);
		scoreLabel.value++;
		scoreLabel.text = `score: ${scoreLabel.value}`;
	});

	keyPress("space", () => {
		spawnKaboom(player.pos.add(player.dir.scale(48)));
	});

	const SLICER_SPEED = 200;

	action("slicer", (s) => {
		s.move(s.dir * SLICER_SPEED, 0);
	});

	collides("slicer", "wall", (s) => {
		s.dir = -s.dir;
	});

	const SKELETOR_SPEED = 140;

	action("skeletor", (s) => {
		s.move(0, s.dir * SKELETOR_SPEED);
		s.timer -= dt();
		if (s.timer <= 0) {
			s.dir = -s.dir;
			s.timer = rand(5);
		}
	});

	collides("skeletor", "wall", (s) => {
		s.dir = -s.dir;
	});

	player.overlaps("dangerous", () => {
		go("lose", { score: scoreLabel.value });
	});
});

scene("lose", ({ score }) => {
	add([
		text(`score: ${score}`, 32),
		origin("center"),
		pos(width() / 2, height() / 2),
	]);
	add([
		text("Press Space to Restart", 32),
		origin("center"),
		pos(width() / 2, height() / 2 - 80),
	]);

	keyPress("space", () => {
		location.reload();
	});
});

start("game", { level: 0, score: 0 });
