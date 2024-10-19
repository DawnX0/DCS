import SimpleTimer from "@rbxts/simpletimer";

const UNIQUE_ACTOR_ID = "__DCS";

type ACTOR_ENTRIES_TYPE = {
	Model: Model;
	StatusEffects: Map<string, ReturnType<(typeof SimpleTimer)["CreateTimer"]>>;
	Cooldowns: Map<string, boolean>;

	ApplyStatusEffect: (statusEffectName: string) => void;
	RemoveStatusEffect: (statusEffectName: string) => void;
	CastSkill: (skillName: string) => void;
	StopSkill: (skillName: string) => void;
};
type ACTOR_REGISTRY_TYPE = Map<string, ACTOR_ENTRIES_TYPE>;

type STATUSEFFECT_TYPE = {
	Name: string;
	Duration: number;
	Tick: number;
	Effect: (entries: ACTOR_ENTRIES_TYPE) => void;
};

type STATUSEFFECT_REGISTRY_TYPE = Map<string, STATUSEFFECT_TYPE>;

type SKILL_TYPE = {
	Name: string;
	CastTime: number;
	Cooldown: number;
	Cast: (entries: ACTOR_ENTRIES_TYPE) => void;
};

type SKILL_REGISTRY_TYPE = Map<string, SKILL_TYPE>;

type WEAPON_TYPE = {
	Name: string;
	Model?: Model;
	Skills?: SKILL_TYPE[];
	Projectile?: Model;
};

class DCS {
	/**
	 *
	 * @remark Created by DawnX0
	 *
	 * @remark Last updated on: 10/18/2024
	 *
	 * @remark Purpose: To be as simple as possible
	 *
	 */

	// ACTORS ----------------------------------------------------------------------------------------------------- \\

	private ActorRegistry: ACTOR_REGISTRY_TYPE = new Map();

	AddActor(newActor: Model) {
		const newEntries: ACTOR_ENTRIES_TYPE = {
			Model: newActor,
			StatusEffects: new Map(),
			Cooldowns: new Map(),

			ApplyStatusEffect: (statusEffectName: string) => {
				const actor = this.GetActor(newActor);
				if (actor) {
					const statusEffect = this.GetStatusEffect(statusEffectName);
					if (statusEffect) {
						const statusEffectTimer = SimpleTimer.CreateTimer(
							statusEffect.Name,
							statusEffect.Duration,
							statusEffect.Tick,
							true,
						);

						statusEffectTimer.onTick.Event.Once(() => statusEffect.Effect(actor));
						actor.StatusEffects.set(statusEffect.Name.lower(), statusEffectTimer);

						statusEffectTimer.Start();
					}
				}
			},

			RemoveStatusEffect: (statusEffectName: string) => {
				const actor = this.GetActor(newActor);
				if (actor) {
					const statusEffectTimer = actor.StatusEffects.get(statusEffectName.lower());
					if (statusEffectTimer) {
						statusEffectTimer.Destroy();
						actor.StatusEffects.delete(statusEffectName.lower());
					}
				}
			},

			CastSkill: (skillName: string) => {
				const actor = this.GetActor(newActor);
				if (actor) {
					const skill = this.GetSkill(skillName);
					if (skill) {
						if (!actor.Cooldowns.get(skill.Name.lower())) {
							actor.Cooldowns.set(skill.Name.lower(), true);

							SimpleTimer.CreateTimer(skill.Name, skill.CastTime, 0, false).onTick.Event.Once(() => {
								skill.Cast(actor);
								actor.Cooldowns.delete(skill.Name.lower());
							});

							skill.Cast(actor);
						}
					}
				}
			},

			StopSkill: (skillName: string) => {},
		};

		newActor.AncestryChanged.Connect(() => {
			this.RemoveActor(newActor);
		});

		newActor.FindFirstChildWhichIsA("Humanoid")?.Died.Once(() => this.RemoveActor(newActor));

		this.ActorRegistry.set(newActor.Name.lower() + UNIQUE_ACTOR_ID, newEntries);
	}

	RemoveActor(sentActor: Model): void {
		this.ActorRegistry.delete(sentActor.Name.lower() + UNIQUE_ACTOR_ID);
	}

	GetActor(sentActor: Model): ACTOR_ENTRIES_TYPE | undefined {
		return this.ActorRegistry.get(sentActor.Name.lower() + UNIQUE_ACTOR_ID);
	}

	// STATUS EFFECTS --------------------------------------------------------------------------------------------- \\

	private StatusEffectRegistry: STATUSEFFECT_REGISTRY_TYPE = new Map();

	CreateStatusEffect(statusEffect: STATUSEFFECT_TYPE): STATUSEFFECT_TYPE {
		return statusEffect;
	}

	AddStatusEffect(statusEffect: STATUSEFFECT_TYPE) {
		this.StatusEffectRegistry.set(statusEffect.Name.lower(), statusEffect);
	}

	RemoveStatusEffect(statusEffectName: string) {
		this.StatusEffectRegistry.delete(statusEffectName.lower());
	}

	RegisterStatusEffects(stausEffects: STATUSEFFECT_TYPE[]) {
		stausEffects.forEach((statusEffect) => this.AddStatusEffect(statusEffect));
	}

	GetStatusEffect(statusEffectName: string): STATUSEFFECT_TYPE | undefined {
		return this.StatusEffectRegistry.get(statusEffectName.lower());
	}

	// SKILLS ----------------------------------------------------------------------------------------------------- \\

	private SkillRegistry: SKILL_REGISTRY_TYPE = new Map();

	CreateSkill(skill: SKILL_TYPE): SKILL_TYPE {
		return skill;
	}

	AddSkill(skill: SKILL_TYPE) {
		this.SkillRegistry.set(skill.Name.lower(), skill);
	}

	RemoveSkill(skillName: string) {
		this.SkillRegistry.delete(skillName.lower());
	}

	RegisterSkills(skills: SKILL_TYPE[]) {
		skills.forEach((skill) => this.AddSkill(skill));
	}

	GetSkill(skillName: string): SKILL_TYPE | undefined {
		return this.SkillRegistry.get(skillName.lower());
	}

	// WEAPONS ---------------------------------------------------------------------------------------------------- \\

	private WeaponRegistry: Map<string, WEAPON_TYPE> = new Map();

	CreateWeapon(weapon: WEAPON_TYPE): WEAPON_TYPE {
		return weapon;
	}

	AddWeapon(weapon: WEAPON_TYPE) {
		this.WeaponRegistry.set(weapon.Name.lower(), weapon);
	}

	RemoveWeapon(weaponName: string) {
		this.WeaponRegistry.delete(weaponName.lower());
	}

	RegisterWeapons(weapons: WEAPON_TYPE[]) {
		weapons.forEach((weapon) => this.AddWeapon(weapon));
	}

	GetWeapon(weaponName: string): WEAPON_TYPE | undefined {
		return this.WeaponRegistry.get(weaponName.lower());
	}

	// ------------------------------------------------------------------------------------------------------------ \\
}

export default new DCS();
