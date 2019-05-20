$(() => {
	mapboxgl.accessToken = 'pk.eyJ1IjoieW9ya3NhdyIsImEiOiJjanZzdHJ0YzMwanh1M3lsOWJvOGE3am04In0.C-elzGSFlpu5fKoD0CDVuQ';

	const map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/yorksaw/cjvsygno11uw21cs0rcogbonh',
		center: [-73.792, 40.719],
		zoom: 12
	});

	map.addControl(new MapboxGeocoder({
		accessToken: mapboxgl.accessToken,
		mapboxgl: mapboxgl
	}).on('result', data => {
		const coords = data.result.center
		_loadStoresAt(coords[0], coords[1], 500)
	}));

	map.addControl(new mapboxgl.GeolocateControl({
		positionOptions: {
			enableHighAccuracy: true
		},
		trackUserLocation: true
	}));

	function _loadStoresAt(lng, lat, limit) {
		$.get(`/stores?lat=${lat}&lng=${lng}&limit=${limit}`, stores => {
			stores.features.forEach(marker => {
				const store = marker.properties

				const el = document.createElement('img')
				el.className = 'marker'
				el.src = 'https://img.icons8.com/color/48/000000/marker.png'
				el.style.height = '20px';

				const url = 'https://www.doordash.com' + store.url

				new mapboxgl.Marker(el)
					.setLngLat(marker.geometry.coordinates)
					.setPopup(new mapboxgl.Popup({offset: 25})
						.setHTML(`
					<a href="${url}" target="_blank">
						<div class="preview">
							<img src="${store.img}"/>
				            <h2>${store.name}</h2>
				            <p>Average of <span>${store.avg_rating}</span> stars out of <span>${store.num_rating}</span> ratings.</p>
						</div>
					</a>
				`))
					.addTo(map);
			})
		})
	}

})
