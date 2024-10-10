type STATUSEFFECT = {
	name: "";
	duration: number;
	effect: (model: Model) => void;
};

type STATUSEFFECT_REGISTRY = Map<string, STATUSEFFECT[]>;

class DCS {
	// Timer
	private timers: WeakMap<Model, { [timerName: string]: thread }> = new WeakMap();

	// Timer Methods
	addTimer(timerName: string, duration: number) {
		const newTimer = task.delay(duration, () => {
			
		})
	}
}

export default new DCS();
