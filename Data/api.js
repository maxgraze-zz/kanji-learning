var apiToken = "df52b08f-688b-437e-ac70-a7c1619e6989";

//define helper functions
const getWkItems = async function fetchAllReviewStats(
	endpoint = "review_statistics"
) {
	let requests = {
		method: "GET",
		headers: { Authorization: "Bearer " + apiToken },
	};
	let results = new Array();

	let nextUrl = `https://api.wanikani.com/v2/${endpoint}`;
	while (nextUrl) {
		let resp = await fetch(nextUrl, requests);
		if (resp.ok) {
			let body = await resp.json();
			nextUrl = body.pages.next_url;
			results.push(...body.data);
		} else {
			throw Error(`${resp.status}: ${resp.statusText}`);
		}
	}
	return results;
};

//get review data
// async function joinData () {
	const joinData = async () => {

	const subjects = new Map();
let getSubjects = await fetch('./wanikaniKanji.json')
  .then(response => response.json())
  .then(data => data.forEach((d) => {
			subjects.set(d.id, {
				updated_at: d.updated_at,
				characters: d.characters,
				level: d.level,
			});
		}))
  .catch(err => console.log(err));

//.sort((a, b) => a.level - b.level)
	const reviewStats = new Map();
	const getReviewStats = await getWkItems("review_statistics").then((data) => {
		data.forEach((d) => {
if (d.data.subject_type === "kanji") {
			reviewStats.set(d.data.subject_id, {
				updated_at: d.data_updated_at,
      percentage_correct: d.data.percentage_correct,
        subject_id: d.data.subject_id,
        subject_type: d.data.subject_type
			});
		}
		});
	});

	//sort data
	let sortedReviewStats = new Map(
		Array.from(reviewStats.entries()).sort(
			(e1, e2) => Date.parse(e2[1].updated_at) - Date.parse(e1[1].updated_at)
		)
	);
	//connect subject to sorted data view
	const joinedData = new Map();
	subjects.forEach((d, id) => {
		joinedData.set(id, { ...d, stats: sortedReviewStats.get(id) }); //this looks up subject by its id
	});

   return Object.fromEntries(joinedData)
};

//joinData().then(d => console.log(d))