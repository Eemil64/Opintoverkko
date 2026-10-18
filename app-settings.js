const defaultSettings = {
	name: "Eemil Puupponen",
	program: "Tietojenkäsittely, tradenomi",
	studyMode: "Monimuoto-opiskelu",
	deadlines: false,
	lessons: false,
	courseNews: false
};

const settingKeys = Object.keys(defaultSettings);

const readSettings = () => Object.fromEntries(
	settingKeys.map((key) => {
		const value = localStorage.getItem(`opintoverkko.${key}`);
		return [key, value === null ? defaultSettings[key] : value];
	})
);

const saveSettings = (settings) => {
	for (const key of settingKeys) {
		localStorage.setItem(`opintoverkko.${key}`, String(settings[key]));
	}
};

const getInitials = (name) => name
	.trim()
	.split(/\s+/)
	.filter(Boolean)
	.slice(0, 2)
	.map((part) => part[0].toLocaleUpperCase("fi-FI"))
	.join("");

const applySettings = (settings) => {
	document.querySelectorAll("[data-profile-name]").forEach((element) => {
		element.textContent = settings.name;
	});
	document.querySelectorAll("[data-profile-initials]").forEach((element) => {
		element.textContent = getInitials(settings.name);
	});
	document.querySelectorAll("[data-profile-program]").forEach((element) => {
		element.textContent = settings.program;
	});
	document.querySelectorAll("[data-profile-study-mode]").forEach((element) => {
		element.textContent = settings.studyMode;
	});
};

const populateSettingsForm = (settings) => {
	const form = document.querySelector("#settings-form");
	if (!form) {
		return;
	}

	form.elements.namedItem("name").value = settings.name;
	form.elements.namedItem("program").value = settings.program;
	form.elements.namedItem("studyMode").value = settings.studyMode;
	for (const key of ["deadlines", "lessons", "courseNews"]) {
		form.elements.namedItem(key).checked = settings[key] === "true" || settings[key] === true;
	}
};

let currentSettings = readSettings();
applySettings(currentSettings);
populateSettingsForm(currentSettings);

const settingsForm = document.querySelector("#settings-form");
if (settingsForm) {
	const status = document.querySelector("#settings-status");

	settingsForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const formData = new FormData(settingsForm);
		currentSettings = {
			name: String(formData.get("name")).trim(),
			program: String(formData.get("program")).trim(),
			studyMode: String(formData.get("studyMode")),
			deadlines: settingsForm.elements.namedItem("deadlines").checked,
			lessons: settingsForm.elements.namedItem("lessons").checked,
			courseNews: settingsForm.elements.namedItem("courseNews").checked
		};
		saveSettings(currentSettings);
		applySettings(currentSettings);
		status.textContent = "Asetukset tallennettu.";
	});

	document.querySelector("#reset-settings").addEventListener("click", () => {
		currentSettings = { ...defaultSettings };
		saveSettings(currentSettings);
		populateSettingsForm(currentSettings);
		applySettings(currentSettings);
		status.textContent = "Oletusasetukset palautettu.";
	});
}
