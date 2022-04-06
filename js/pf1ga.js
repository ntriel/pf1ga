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
}
Hooks.on("ready", async function () {
    game.socket.on(`module.pf1ga`, (data) => {
        console.log(data);
    });
});

function StartGrapple(){
	let dialogBox = new Dialog({
		title: "Start Grapple",
		content: "<p>Can you avoid provoking an AOO?</p>",
		buttons: {
			yes: {
				icon: '<i class="fas fa-check"></i>',
				label: "Yes",
				callback: () => {
					game.socket.emit(`module.pf1ga`, {
						"action": "startGrapple",
						"grappler": token,
						"grappled": (game.user.targets.length === 1 ? game.user.targets : null)
					});
				}
			},
			no: {
				icon: '<i class="fas fa-times"></i>',
				label: "No",
				callback: () => {
					
				}
			}
		},
		default: "two",
		render: html => console.log("Register interactivity in the rendered dialog"),
		close: html => console.log("This always is logged no matter which option is chosen")
	});
	dialogBox.render(true);
}