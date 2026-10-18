const weekdayNames = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];
const events = [
	{
		date: "2026-10-19",
		time: "09.00",
		duration: 90,
		title: "Digitaalinen viestintä",
		details: "Luokka 3202 · 90 min",
		type: "class",
		label: "Opetustapahtuma"
	},
	{
		date: "2026-10-19",
		time: "12.00",
		duration: 60,
		title: "Tietokannat ja SQL",
		details: "Verkossa · Harjoitukset",
		type: "online",
		label: "Verkko-opetus"
	},
	{
		date: "2026-10-20",
		time: "23.59",
		duration: 1,
		title: "SQL-harjoituksen palautus",
		details: "Tietokannat ja SQL",
		type: "deadline",
		label: "Palautuksen määräaika"
	},
	{
		date: "2026-10-22",
		time: "23.59",
		duration: 1,
		title: "Käyttöliittymän luonnos",
		details: "Käyttöliittymäsuunnittelu UI/UX",
		type: "deadline",
		label: "Palautuksen määräaika"
	},
	{
		date: "2026-10-23",
		time: "10.00",
		duration: 90,
		title: "Ammatillinen englanti",
		details: "Luokka 2405 · 90 min",
		type: "class",
		label: "Opetustapahtuma"
	}
];

const calendarGrid = document.querySelector("#calendar-grid");
const weekSchedule = document.querySelector("#week-schedule");
const weekTimetable = document.querySelector("#week-timetable");
const weekDeadlines = document.querySelector("#week-deadlines");
const weekDeadlineList = document.querySelector("#week-deadline-list");
const dayAgenda = document.querySelector(".day-agenda");
const calendarHeading = document.querySelector("#kalenteri-otsikko");
const weekNumber = document.querySelector("#week-number");
const agendaHeading = document.querySelector("#agenda-otsikko");
const eventList = document.querySelector("#event-list");
const monthViewButton = document.querySelector("#month-view");
const weekViewButton = document.querySelector("#week-view");
const previousPeriodButton = document.querySelector("#previous-period");
const nextPeriodButton = document.querySelector("#next-period");
const todayButton = document.querySelector("#today-button");

const today = new Date();
today.setHours(12, 0, 0, 0);
let selectedDate = new Date(today);
let view = "month";

const dateKey = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const dateFromKey = (key) => {
	const [year, month, day] = key.split("-").map(Number);
	return new Date(year, month - 1, day, 12);
};

const mondayOf = (date) => {
	const monday = new Date(date);
	monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
	return monday;
};

const isoWeekNumber = (date) => {
	const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const weekday = thursday.getUTCDay() || 7;
	thursday.setUTCDate(thursday.getUTCDate() + 4 - weekday);
	const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
	return Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
};

const formatDate = (date, options) => new Intl.DateTimeFormat("fi-FI", options).format(date);

const eventsOn = (date) => events.filter((event) => event.date === dateKey(date));

const addWeekdayHeadings = () => {
	for (const day of weekdayNames) {
		const heading = document.createElement("li");
		heading.className = "weekday";
		heading.setAttribute("aria-hidden", "true");
		heading.textContent = day;
		calendarGrid.append(heading);
	}
};

const addCalendarDay = (date, displayMonth) => {
	const key = dateKey(date);
	const dayEvents = eventsOn(date);
	const deadlines = dayEvents.filter((event) => event.type === "deadline");
	const item = document.createElement("li");
	const button = document.createElement("button");
	const classes = ["calendar-day"];

	if (date.getMonth() !== displayMonth) {
		classes.push("outside-month");
	}
	if (key === dateKey(today)) {
		classes.push("today");
		button.setAttribute("aria-current", "date");
	}
	if (key === dateKey(selectedDate)) {
		classes.push("is-selected");
		button.setAttribute("aria-pressed", "true");
	} else {
		button.setAttribute("aria-pressed", "false");
	}
	if (dayEvents.length) {
		classes.push("has-event");
	}
	if (deadlines.length) {
		classes.push("has-deadline");
	}

	button.type = "button";
	button.className = classes.join(" ");
	button.setAttribute(
		"aria-label",
		`${formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} ${dayEvents.length === 1 ? "tapahtuma" : "tapahtumaa"}` : ""}${deadlines.length ? `, ${deadlines.length} ${deadlines.length === 1 ? "palautuksen määräaika" : "palautusten määräaikaa"}` : ""}`
	);
	button.textContent = String(date.getDate());
	button.dataset.date = key;
	item.append(button);
	calendarGrid.append(item);
};

const renderCalendar = () => {
	calendarGrid.replaceChildren();
	calendarGrid.hidden = view === "week";
	weekSchedule.hidden = view !== "week";
	dayAgenda.hidden = view === "week";
	addWeekdayHeadings();

	if (view === "week") {
		const weekStart = mondayOf(selectedDate);
		for (let day = 0; day < 7; day += 1) {
			const date = new Date(weekStart);
			date.setDate(weekStart.getDate() + day);
			addCalendarDay(date, selectedDate.getMonth());
		}
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);
		calendarHeading.textContent = `${formatDate(weekStart, { day: "numeric", month: "numeric" })}–${formatDate(weekEnd, { day: "numeric", month: "numeric", year: "numeric" })}`;
		calendarGrid.setAttribute("aria-label", `Viikon ${isoWeekNumber(selectedDate)} kalenteri, maanantaista sunnuntaihin`);
		agendaHeading.textContent = "Viikon tapahtumat";
		renderWeekTimetable(weekStart);
	} else {
		const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 12);
		const firstDay = mondayOf(monthStart);
		const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
		const gridLength = Math.ceil((((monthStart.getDay() + 6) % 7) + daysInMonth) / 7) * 7;

		for (let day = 0; day < gridLength; day += 1) {
			const date = new Date(firstDay);
			date.setDate(firstDay.getDate() + day);
			addCalendarDay(date, selectedDate.getMonth());
		}
		calendarHeading.textContent = formatDate(selectedDate, { month: "long", year: "numeric" });
		calendarGrid.setAttribute("aria-label", `${calendarHeading.textContent}, maanantaista alkava kalenteri`);
		agendaHeading.textContent = "Kuukauden tapahtumat";
	}

	weekNumber.textContent = `Viikko ${isoWeekNumber(selectedDate)}`;
	previousPeriodButton.setAttribute("aria-label", view === "week" ? "Edellinen viikko" : "Edellinen kuukausi");
	nextPeriodButton.setAttribute("aria-label", view === "week" ? "Seuraava viikko" : "Seuraava kuukausi");
	renderEvents();
};

const createEvent = (event) => {
	const article = document.createElement("article");
	article.className = "event";

	const time = document.createElement("span");
	time.className = "event-time";
	time.append(`${formatDate(dateFromKey(event.date), { weekday: "short" })} ${formatDate(dateFromKey(event.date), { day: "numeric", month: "numeric" })}`);
	time.append(document.createElement("br"), event.time);

	const details = document.createElement("div");
	const title = document.createElement("strong");
	title.textContent = event.title;
	const description = document.createElement("span");
	description.textContent = event.details;
	details.append(title, description);

	const marker = document.createElement("span");
	marker.className = `event-mark${event.type === "online" ? " green" : event.type === "deadline" ? " red" : ""}`;
	marker.setAttribute("aria-label", event.label);

	article.append(time, details, marker);
	return article;
};

const renderEvents = () => {
	const visibleEvents = events.filter((event) => {
		const date = dateFromKey(event.date);
		if (view === "week") {
			const start = mondayOf(selectedDate);
			const end = new Date(start);
			end.setDate(start.getDate() + 7);
			return date >= start && date < end;
		}
		return date.getFullYear() === selectedDate.getFullYear() && date.getMonth() === selectedDate.getMonth();
	});

	eventList.replaceChildren();
	if (visibleEvents.length === 0) {
		const emptyState = document.createElement("p");
		emptyState.className = "note";
		emptyState.textContent = view === "week"
			? "Tälle viikolle ei ole lisätty tapahtumia."
			: "Tälle kuukaudelle ei ole lisätty tapahtumia.";
		eventList.append(emptyState);
		return;
	}

	for (const event of visibleEvents) {
		eventList.append(createEvent(event));
	}
};

const renderWeekTimetable = (weekStart) => {
	weekTimetable.replaceChildren();
	weekTimetable.style.setProperty("--schedule-hour-height", "3.5rem");

	const spacer = document.createElement("div");
	spacer.className = "timetable-corner";
	spacer.setAttribute("aria-hidden", "true");
	weekTimetable.append(spacer);

	const dates = [];
	for (let day = 0; day < 7; day += 1) {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + day);
		dates.push(date);

		const header = document.createElement("div");
		header.className = "timetable-day-heading";
		if (dateKey(date) === dateKey(today)) {
			header.classList.add("is-today");
		}

		const weekday = document.createElement("span");
		weekday.textContent = weekdayNames[day];
		const dateButton = document.createElement("button");
		dateButton.className = "timetable-date-button";
		dateButton.type = "button";
		dateButton.textContent = String(date.getDate());
		dateButton.setAttribute("aria-label", `Valitse ${formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`);
		dateButton.dataset.date = dateKey(date);
		dateButton.addEventListener("click", () => {
			selectedDate = new Date(date);
			renderCalendar();
		});
		header.append(weekday, dateButton);
		weekTimetable.append(header);
	}

	const timeColumn = document.createElement("div");
	timeColumn.className = "timetable-time-column";
	timeColumn.setAttribute("aria-hidden", "true");
	for (let hour = 7; hour < 24; hour += 1) {
		const label = document.createElement("span");
		label.className = "timetable-hour-label";
		label.textContent = `${String(hour).padStart(2, "0")}.00`;
		timeColumn.append(label);
	}
	const dayEnd = document.createElement("span");
	dayEnd.className = "timetable-end-label";
	dayEnd.textContent = "24.00";
	timeColumn.append(dayEnd);
	weekTimetable.append(timeColumn);

	for (const date of dates) {
		const dayColumn = document.createElement("div");
		dayColumn.className = "timetable-day-column";
		dayColumn.setAttribute("aria-label", formatDate(date, { weekday: "long", day: "numeric", month: "long" }));

		for (const event of eventsOn(date)) {
			const [hour, minute] = event.time.split(".").map(Number);
			const startMinutes = hour * 60 + minute;
			if (startMinutes < 7 * 60 || startMinutes >= 24 * 60) {
				continue;
			}
			const block = document.createElement("article");
			block.className = `timetable-event ${event.type}`;
			block.tabIndex = 0;
			if (event.type === "deadline") {
				block.classList.add("is-deadline-marker");
				block.style.bottom = "0";
			} else {
				const visibleDuration = Math.min(Math.max(event.duration, 30), 24 * 60 - startMinutes);
				const topMinutes = startMinutes - 7 * 60;
				block.style.top = `calc(var(--schedule-hour-height) * ${topMinutes / 60})`;
				block.style.height = `max(calc(var(--schedule-hour-height) * ${visibleDuration / 60}), 2.5rem)`;
			}
			const duration = event.type === "deadline" ? "" : ` Kesto ${event.duration} minuuttia.`;
			block.setAttribute("aria-label", `${event.time}, ${event.title}. ${event.details}. ${event.label}.${duration}`);

			const time = document.createElement("strong");
			time.className = "timetable-event-time";
			time.textContent = event.time;
			const title = document.createElement("span");
			title.className = "timetable-event-title";
			title.textContent = event.title;
			block.append(time, title);
			dayColumn.append(block);
		}

		weekTimetable.append(dayColumn);
	}

	const deadlines = dates.flatMap((date) => eventsOn(date)
		.filter((event) => event.type === "deadline")
		.map((event) => ({ ...event, dueDate: date })));
	weekDeadlineList.replaceChildren();
	weekDeadlines.hidden = deadlines.length === 0;
	for (const event of deadlines) {
		const item = document.createElement("li");
		const date = document.createElement("span");
		date.className = "tag red";
		date.textContent = formatDate(event.dueDate, { weekday: "short", day: "numeric", month: "numeric" });
		const title = document.createElement("span");
		title.textContent = event.title;
		item.append(date, title);
		weekDeadlineList.append(item);
	}
};

const setView = (nextView) => {
	view = nextView;
	monthViewButton.classList.toggle("is-active", view === "month");
	weekViewButton.classList.toggle("is-active", view === "week");
	monthViewButton.setAttribute("aria-pressed", String(view === "month"));
	weekViewButton.setAttribute("aria-pressed", String(view === "week"));
	renderCalendar();
};

calendarGrid.addEventListener("click", (event) => {
	const dayButton = event.target.closest("button[data-date]");
	if (!dayButton) {
		return;
	}
	selectedDate = dateFromKey(dayButton.dataset.date);
	renderCalendar();
});

monthViewButton.addEventListener("click", () => setView("month"));
weekViewButton.addEventListener("click", () => setView("week"));
previousPeriodButton.addEventListener("click", () => {
	if (view === "week") {
		selectedDate.setDate(selectedDate.getDate() - 7);
	} else {
		selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1, 12);
	}
	renderCalendar();
});
nextPeriodButton.addEventListener("click", () => {
	if (view === "week") {
		selectedDate.setDate(selectedDate.getDate() + 7);
	} else {
		selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1, 12);
	}
	renderCalendar();
});
todayButton.addEventListener("click", () => {
	selectedDate = new Date(today);
	renderCalendar();
});

renderCalendar();
