import SimpleTimer from "@rbxts/simpletimer";

type StatusEffect = {
	Name: string;
	Duration: number;
	Tick: number;
	Effect: (entries: ActorEntries) => void;
};

type StatusEffectRegistry = Map<string, StatusEffect>;

type ActorEntries = {
	Name: string;
	Model: Model;
	StatusEffects: Map<string, ReturnType<(typeof SimpleTimer)["CreateTimer"]>>;

	ApplyStatusEffect: (statusEffectName: string) => void;
	RemoveStatusEffect: (statusEffectName: string) => void;

	CastSkill: (skillName: string) => void;
};
type ActorRegistry = Map<Model, ActorEntries>;

class DCS {
	// Actors
	private Actors: ActorRegistry = new Map();

	// Methods
	AddActor(sentActor: Model) {
		if (!sentActor.FindFirstChildWhichIsA("Humanoid") || !sentActor.FindFirstChild("HumanoidRootPart")) return;

		sentActor.AncestryChanged.Once((child) => {
			const actorEntries = this.Actors.get(sentActor);
			if (!actorEntries) return;

			// Remove the actor from the actors registry
			this.Actors.delete(sentActor);
		});

		this.Actors.set(sentActor, {
			Name: sentActor.Name,
			Model: sentActor,
			StatusEffects: new Map(),

			ApplyStatusEffect: (statusEffectName: string) => {
				const actor = this.GetActor(sentActor);
				if (!actor) return;

				// Apply the status effect to the actor
				const statusEffect = this.GetStatusEffect(statusEffectName.lower());
				if (statusEffect) {
					const effectTimer = SimpleTimer.CreateTimer(
						statusEffect.Name,
						statusEffect.Duration,
						statusEffect.Tick,
						true,
					);

					effectTimer.onTick.Event.Connect(() => statusEffect.Effect(actor));
					actor.StatusEffects.set(statusEffectName.lower(), effectTimer);
					effectTimer.Start();
				} else warn(`${statusEffectName} was not found within the registered status effects`);

				print(actor.StatusEffects);
			},
			RemoveStatusEffect: (statusEffectName: string) => {
				// Remove the status effect from the actor
				const actor = this.GetActor(sentActor);
				if (!actor) return;

				const effectTimer = actor.StatusEffects.get(statusEffectName.lower());
				if (effectTimer) {
					effectTimer.Destroy();
				}
				actor.StatusEffects.delete(statusEffectName);
				print(actor.StatusEffects);
			},
			CastSkill: (skillName: string) => {
				// Cast the skill on the actor
			},
		});
	}

	RemoveActor(actor: Model) {
		this.Actors.delete(actor);
	}

	GetActor(actor: Model): ActorEntries | undefined {
		return this.Actors.get(actor);
	}

	// Status Effects
	private StatusEffectRegistry: StatusEffectRegistry = new Map();

	// Methods
	CreateStatusEffect(
		name: string,
		duration: number,
		tick: number,
		effect: (entries: ActorEntries) => void,
	): StatusEffect {
		return {
			Name: name,
			Duration: duration,
			Tick: tick,
			Effect: (entries: ActorEntries) => effect(entries),
		};
	}

	CopyStatusEffect(statusEffect: StatusEffect): StatusEffect {
		return {
			Name: statusEffect.Name,
			Duration: statusEffect.Duration,
			Tick: statusEffect.Tick,
			Effect: statusEffect.Effect,
		};
	}

	AddStatusEffect(statusEffect: StatusEffect) {
		this.StatusEffectRegistry.set(statusEffect.Name.lower(), statusEffect);
	}

	RemoveStatusEffect(statusEffectName: string) {
		this.StatusEffectRegistry.delete(statusEffectName);
	}

	GetStatusEffect(statusEffectName: string): StatusEffect | undefined {
		return this.StatusEffectRegistry.get(statusEffectName);
	}
}

export default new DCS();
