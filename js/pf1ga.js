let pf1ga = {
	grappleContent: 
	`<div class="pf1ga-grappleContent">
		<select class="AvoidAOO" value="">
			<option value="">Can you avoid AOO?</option>
			<option value="true">Yes</option>
			<option value="false">No</option>
		</select>
		<select class="AvoidAOO" value="">
			<option value="">Can you avoid AOO?</option>
			<option value="true">Yes</option>
			<option value="false">No</option>
		</select>
	</div>`,
	applyGrappleContent: `
		<button class="pf1ga-toggleGrapple">Toggle Grapple</button>
	`,
}
Hooks.on("ready", async function () {
    game.socket.on(`module.pf1ga`, (data) => {
		console.log(data);
		switch(data.action){
			case "startGrapple":
				startGrapple(data);
			break;
		}
		
    });
});

Hooks.on("updateCombat", async (CombatPF, TurnData, TimeData, id) => {
	if(game.user.isGM){
		if(CombatPF.combatant.actor.data.data.attributes.conditions.grappled){
			let content = `
			<button class="pf1ga-toggleGrappledDisplayButton pf1ga-toggleHiddenElement">Defending Grappler's Turn</button>
			<div class="pf1ga-grappledTurn pf1ga-hideOnStart" hidden="true">
				<p>Attempt to break free or become the controlling grappler.</p>
				<button class="pf1ga-cmbCheck" data-rollBonus="" data-rollBonusReason="">Roll CMB</button>
				<hr class="pf1ga-solid">
				<p>Take any action that doesn't require two hands.</p>
				<hr class="pf1ga-solid">
				<p>Attack or full attack with a light or one-handed weapon at a -2 to hit</p>
				<hr class="pf1ga-solid">
				<p>Cast a spell without somatic components and with material components(if any) the Defender has in hand by making a concentration check(DC 10 + Controlling Grappler's CMB + spell level)</p>
			</div>
			<hr class="pf1ga-rounded">
			<button class="pf1ga-toggleGrapplerDisplayButton pf1ga-toggleHiddenElement">Controlling Grappler's Turn</button>
			<div class="pf1ga-grapplerTurn pf1ga-hideOnStart" hidden="true">
				<p>Maintain Grapple, and perform some other action on Defender as Standard Action(rolls CMB +5 vs Defender’s CMD)</p>
				<button class="pf1ga-cmbCheck" data-rollBonus="+5" data-rollBonusReason="[Controlling Grappler]">Roll CMB +5</button>
				<hr class="pf1ga-solid">
				<p>Release the grapple as a Free Action.</p>
				<hr class="pf1ga-solid">
				<p>Tie Defender up</p>
				<p>Is the Defending creature restrained, Pinned, or unconcious?</p>
				<ul>
					<li>Yes: No check required.</li>
					<li>No: Controlling Grappler rolls CMB -10 vs Defender's CMD</li>
				</ul>
				<button class="pf1ga-cmbCheck" data-rollBonus="-10" data-rollBonusReason="[Defender not restrained, Pinned, or unconcious]">Roll CMB -10</button>
			</div>
			`;
			CreateMessage(content);
		}
	}
	
});

Hooks.on("renderChatMessage", async function (chatItem, html) {
	console.log("chatItem:",chatItem,"html",html);
	
	if(chatItem.data.AOO){
		console.log("AOO:",chatItem.data.AOO);
	}else if(!chatItem.data.AOO){
		console.log("!AOO:",chatItem.data.AOO);
	}
	
	if(html.find("h3[data-aoo]") != null){
		
	}
	
	if(html.find(".pf1ga-hideOnStart").length > 0){
		for(let i = 0; i < html.find(".pf1ga-hideOnStart").length; i++){
			html.find(".pf1ga-hideOnStart")[i].hidden = true; 
		}
	}
	
	html.find(".pf1ga-toggleHiddenElement").click(async e => {
		e.currentTarget.nextElementSibling.hidden = !e.currentTarget.nextElementSibling.hidden;
	});
	
	html.find(".pf1ga-toggleGrapple").click(async e => {
		canvas.tokens.controlled.forEach(token => toggleCondition(token.actor,"grappled"));
	});
	
	html.find(".pf1ga-cmbCheck").click(async e => {
		let id = (game.user.character != null ? canvas.tokens.children[0].children.filter(token => token.name == game.user.charname)[0].id : (canvas.tokens.controlled.length > 0 ? canvas.tokens.controlled[0].id : ""))
		if(id != ""){
			canvas.tokens.get(id).actor.rollCMB({dice:[`1d20${e.currentTarget.dataset.rollbonus}${e.currentTarget.dataset.rollbonusreason}`]}).then(() =>{
				let content = "";
				switch(e.currentTarget.innerText){
					case "Roll CMB +5":
						content = `
							<button class="pf1ga-toggleHiddenElement">Success</button>
							<div class="pf1ga-hideOnStart">
							<p>If successful Controlling Grappler may choose to do nothing but maintain grapple, or:</p>
							<ul>
								<li>move self and Defender up to ½ Attacker’s movement. At end of move, Attacker places Defender in any open adjacent square. If square is hazardous, Defender gets free attempt to break Grapple with +4 bonus.</li>
								<li>inflict lethal or non-lethal unarmed strike, natural attack, armor spike, or light/one-handed weapon damage to Defender.</li>
								<li>give Defender the Pinned condition. Attacker continues to have Grappled condition but loses Dex bonus to AC.</li>
							</ul>
							</div>
							<hr class="pf1ga-rounded">
							<button class="pf1ga-toggleHiddenElement">Failure</button>
							<div class="pf1ga-hideOnStart">
							<p>If unsuccessful both parties lose Grappled condition.</p>
							</div>
							`;
						CreateMessage(content);
					break;
					case "Roll CMB -10":
						content = `
							<button class="pf1ga-toggleHiddenElement">Success</button>
							<div class="pf1ga-hideOnStart">
							<p>If successful Controlling Grappler  uses rope or similar binding to tie the Defender up. This works like a Pin effect, but the DC to escape the bonds is 20 + Controlling Grappler’s Combat Maneuver bonus (instead of just the Controlling Grappler’s CMD). If the DC to escape is higher than 20 + Defender’s CMB, the Defender cannot escape from the bonds, even with a natural 20 on the check.</p>
							</div>
							<hr class="pf1ga-rounded">
							<button class="pf1ga-toggleHiddenElement">Failure</button>
							<div class="pf1ga-hideOnStart">
							<p>If unsuccessful Controlling Grappler fails to tie up Defender, but keeps control of Grapple.</p>
							</div>
						`;
						CreateMessage(content);
					break;
				}
			});
		}
	});
	
});

function startGrapple(data){
	console.log(data);
	console.log(canvas.tokens.children[0].children.filter(token => token.actor.id === data.grappler.id)[0]);
	console.log(canvas.tokens.children[0].children.filter(token => token.id === data.grappled)[0]);
	
	let content = `
		<h3 data-aoo="false">` + (data.aoo ? "Provokes AOO" : "Doesn't Provoke AOO") + `</h3>` + pf1ga.applyGrappleContent +`
		<hr class="pf1ga-rounded">
		<button class="pf1ga-toggleHiddenElement">Success</button>
		<div class="pf1ga-hideOnStart">
			<p>Is the Defender adjacent to Attacker?</p>
			<ul>
				<li>Yes: Grapple succeeds. Both parties gain Grappled condition. Attacker gains a +5 to CMB check next round to maintain the grapple. Standard Action Ends.</li>
				<li>No: Is an open square adjacent to Attacker available?</li>
				<ul>
					<li>Yes: Move Defender to adjacent open square of Attackers choice then Grapple succeeds. Both parties gain Grappled condition. Attacker gains a +5 to CMB check next round to maintain the grapple. Standard Action Ends.</li>
					<li>No: Grapple fails. Neither party is considered Grappled.</li>
				</ul>
			</ul>
		</div>
		<hr class="pf1ga-rounded">
		<button class="pf1ga-toggleHiddenElement">Failure</button>
		<div class="pf1ga-hideOnStart">
			<p>Grapple fails. Neither party is considered Grappled.</p>
		</div>
	`;
	CreateMessage(content);
}

function applyCondition(actor, condition){
	actor.update({["data.attributes.conditions." + condition]: true});
}

function removeCondition(actor, condition){
	actor.update({["data.attributes.conditions." + condition]: false});
}

function toggleCondition(actor, condition){
	actor.update({["data.attributes.conditions." + condition]: !actor.data.data.attributes.conditions[condition]});
}

function StartGrapple(){
	let dialogBox = new Dialog({
		title: "Start Grapple",
		content: "<p>Can you avoid provoking an AOO?</p>",
		buttons: {
			yes: {
				icon: '<i class="fas fa-check"></i>',
				label: "Yes",
				callback: () => {
					let grappler;
					if(game.user.isGM){
						grappler= canvas.tokens.controlled[0];
					}else{
						grappler = game.user.character;
					}
					
					game.pf1.rollActorAttributeMacro(grappler.id, "cmb").then(() => {
						//let content = `<h3 data-aoo="false">Doesn't Provoke AOO</h3>` + pf1ga.applyGrappleContent;
						startGrapple({
							"action": "startGrapple",
							"grappler": grappler,
							"grappled": game.user.targets.size > 0 ? game.user.targets.first().id : null,
							"aoo":false
						});
					});
					
				}
			},
			no: {
				icon: '<i class="fas fa-times"></i>',
				label: "No",
				callback: () => {
					let grappler;
					if(game.user.isGM){
						grappler= canvas.tokens.controlled[0];
					}else{
						grappler = game.user.character;
					}
					
					 game.pf1.rollActorAttributeMacro(grappler.id, "cmb").then(() => {
						startGrapple({
							"action": "startGrapple",
							"grappler": grappler,
							"grappled": game.user.targets.size > 0 ? game.user.targets.first().id : null,
							"aoo":true
						});					
					 });
					
				}
			}
		},
		default: "no",
		render: html => console.log("Register interactivity in the rendered dialog"),
		close: html => console.log("This always is logged no matter which option is chosen")
	});
	dialogBox.render(true);
}

function CreateMessage(content){
	ChatMessage.create({
		speaker: ChatMessage.getSpeaker({
			alias: 'Grapple Assistant'
		}),
		content: content
	});
}
