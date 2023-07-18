const { addonBuilder, serveHTTP, getRouter, publishToCentral } = require('stremio-addon-sdk')
let dataObj = {};

function getSeriesCatalog(catalogName) {
	let catalog;

	switch (catalogName) {
		case "top":
			catalog = [
				{
					"type": "series",
					"id": "op_onepace",
					"name": "One Pace",
					"poster": "https://i.pinimg.com/564x/dd/71/0e/dd710e95f40046ca9a2c31834e3f9c9b.jpg",
					"genres": [
						"Animation",
						"Comedy",
						"Adventure",
						"Action"
					]
				}
			]
			break
		default:
			catalog = []
			break
	}
	return Promise.resolve(catalog)
}
function getSeriesStreams(id) {
	const streams = [];
    let episode = dataObj.data.episodes.find(episodes => episodes.id === id);
	if (episode.downloads) {
    const infoHash = episode.downloads[0].uri.split("=")[1] || "";
    const name = episode.resolution || "";
	let part = episode.part - 1;
        const obj = {
            "infoHash": infoHash,
			"fileIdx": part,
            "name": name
        };
        streams.push(obj);
	}
	return Promise.resolve(streams || [])
}

function addonSetup() {
	const manifest = {
		"id": "community.onepace-stremio-v2",
		"name": "OnePaceStremioV2",
		"description": "A Better Way to Watch One Pace on Stremio. Go to Discover -> Series -> Watch One Pace. Recommended: Set your default subtitle size to 160% before watching.",
		"logo": "https://i.pinimg.com/originals/66/4a/b8/664ab89e0d4d4aba2b8cae854bde8a0d.png",
		"version": "1.0.0",
		"resources": [
			"catalog",
			{
				"name": "meta",
				"types": ["series"],
				"idprefixes": ["op_"]
			},
			"stream"
		],
		"types": [
			"series"
		],
		"catalogs": [
			{
				"type": "series",
				"id": "top",
				"name": "Watch One Pace",
				"extra": [
					{
						"name": "search",
						"isRequired": false
					}
				]
			}
		]
	}
	const builder = new addonBuilder(manifest);

	builder.defineCatalogHandler(async ({ type, id }) => {
		let results;
		switch (type) {
			case "series":
				results = getSeriesCatalog(id)
				break
			default:
				results = Promise.resolve([])
				break
		}

		const items = await results;
		return ({
			metas: items
		});
	})

	builder.defineMetaHandler(function(args) {
		if (args.type === 'series' && args.id === 'op_onepace') {
			const metaObj = {
					"id": "op_onepace",
					"type": "series",
					"name": "One Pace",
					"poster": "https://i.pinimg.com/564x/dd/71/0e/dd710e95f40046ca9a2c31834e3f9c9b.jpg",
					"genres": [
						"Animation",
						"Comedy",
						"Adventure",
						"Action"
					],
					"description": "One Pace is a fan project that recuts the One Piece anime in an endeavor to bring it more in line with the pacing of the original manga by Eiichiro Oda. The team accomplishes this by removing filler scenes not present in the source material. This process requires meticulous editing and quality control to ensure seamless music and transitions.",
					"director": [
						"Toei Animation"
					],
					"logo": "https://onepace.net/images/one-pace-logo.svg",
					"background": "https://i.pinimg.com/originals/75/a8/37/75a8375458e161bbd148b7213f45f779.jpg",
					"videos": []
				
			}
			let season = 0;
			let epdata = dataObj.data.episodes;

			for (let i = 0; i < dataObj.data.episodes.length; i++) {
				let eptitle = epdata[i].invariant_title;
				if (epdata[i].part === 1) {
					season++;
				}
				if(epdata[i].released_at===null) {
					eptitle = `Unreleased, Anime Ep. ${epdata[i].anime_episodes}`;
				}
				let ep = {
					"season": season,
					"episode": epdata[i].part,
					"id": epdata[i].id,
					"title": eptitle,
					"released": epdata[i].released_at,
					"anime_episodes": epdata[i].anime_episodes
				};
				metaObj.videos[i] = ep;
			}
			return Promise.resolve({ meta: metaObj })
		} else {
			// otherwise return no meta
			return Promise.resolve({ meta: {} })
		}
	})

	builder.defineStreamHandler(async ({ type, id }) => {
		let results;
		switch (type) {
			case 'series':
				results = getSeriesStreams(id)
				break
			default:
				results = Promise.resolve([])
				break
		}
		const streams = await results;
		
		return ({ streams });
	})

	return builder.getInterface()
}

async function fetchData() {
	let query = `query GetEpisodes {
    episodes {
      anime_episodes
      arc {
        invariant_title
      }
      downloads {
        type
        uri
      }
      duration
      id
      invariant_title
      part
      released_at
      resolution
    }
  }`;

	try {
		const response = await fetch('https://onepace.net/api/graphql', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"query": query,
				"variables": {
					"language_code": "en"
				}
			})
		});

		dataObj = await response.json();
		let builder = addonSetup();
		return builder;
	} catch (error) {
		console.log("Error:", error);
	}
}




module.exports = {
	addonBuilder: async () => {
		const builder = await fetchData();
		return builder;
	}
}



