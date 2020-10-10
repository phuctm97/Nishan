class View {
	constructor (obj) {
		Object.entries(obj).forEach(([ key, value ]) => (this[key] = value));
	}

	static setStatic (obj) {
		Object.entries(obj).forEach(([ key, value ]) => (View[key] = value));
		return View;
	}
}

module.exports = View;